<?php

namespace App\Service;

use Predis\Client;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\Filesystem\Filesystem;
use App\Security\SandboxScanner;

class UploadManager
{
    private Client $redis;
    private string $tempDir;
    private string $storageDir;
    private Filesystem $filesystem;
    private SandboxScanner $sandboxScanner;

    public function __construct(string $projectDir, SandboxScanner $sandboxScanner)
    {
        $this->sandboxScanner = $sandboxScanner;
        $this->redis = new Client([
            'scheme' => 'tcp',
            'host'   => '127.0.0.1',
            'port'   => 6379,
        ]);
        
        $this->tempDir = $projectDir . '/var/uploads/temp';
        $this->storageDir = $projectDir . '/var/uploads/storage';
        $this->filesystem = new Filesystem();
        
        $this->filesystem->mkdir([$this->tempDir, $this->storageDir]);
    }

    /** Initializes upload metadata and sets 24-hour expiration in Redis. */
    public function initiate(string $filename, int $totalChunks, int $totalSize, string $checksum): string
    {
        $uploadId = uniqid('upl_', true);
        
        $metadata = [
            'filename' => $filename,
            'total_chunks' => $totalChunks,
            'total_size' => $totalSize,
            'checksum' => $checksum,
            'status' => 'pending',
            'created_at' => time()
        ];
        
        $this->redis->hset("upload:$uploadId", 'metadata', json_encode($metadata));
        $this->redis->expire("upload:$uploadId", 86400);
        
        $this->redis->del("upload:$uploadId:chunks");
        
        return $uploadId;
    }

    /** Saves a received chunk to disk and tracks its index in Redis. */
    public function handleChunk(string $uploadId, int $chunkIndex, string $chunkData): bool
    {
        $metadataStr = $this->redis->hget("upload:$uploadId", 'metadata');
        if (!$metadataStr) {
            throw new \Exception('Upload session not found');
        }
        
        $chunkDir = $this->tempDir . '/' . $uploadId;
        $this->filesystem->mkdir($chunkDir);
        
        $chunkFile = $chunkDir . '/' . $chunkIndex;
        file_put_contents($chunkFile, $chunkData);
        
        $this->redis->sadd("upload:$uploadId:chunks", [$chunkIndex]);
        $this->redis->expire("upload:$uploadId", 86400);
        $this->redis->expire("upload:$uploadId:chunks", 86400);
        
        return true;
    }

    /** Reassembles chunks, verifies signatures, and persists the final file. */
    public function finalize(string $uploadId): array
    {
        $metadataStr = $this->redis->hget("upload:$uploadId", 'metadata');
        if (!$metadataStr) {
            throw new \Exception('Upload session not found');
        }
        
        $metadata = json_decode($metadataStr, true);
        $totalChunks = (int)$metadata['total_chunks'];
        
        $receivedChunks = $this->redis->smembers("upload:$uploadId:chunks");
        if (count($receivedChunks) < $totalChunks) {
            throw new \Exception('Missing chunks');
        }
        
        $chunkDir = $this->tempDir . '/' . $uploadId;
        $dateDir = date('Y-m-d');
        $finalDir = $this->storageDir . '/' . $dateDir;
        $this->filesystem->mkdir($finalDir);
        
        // Temporary reassembled file
        $tempFinalPath = $this->tempDir . '/' . $uploadId . '_final';
        
        $out = fopen($tempFinalPath, 'wb');
        for ($i = 0; $i < $totalChunks; $i++) {
            $chunkFile = $chunkDir . '/' . $i;
            if (!file_exists($chunkFile)) {
                fclose($out);
                throw new \Exception("Chunk $i is missing on disk");
            }
            $in = fopen($chunkFile, 'rb');
            stream_copy_to_stream($in, $out);
            fclose($in);
        }
        fclose($out);
        
        // Secondary Validation: Magic Number
        if (!$this->validateMagicNumber($tempFinalPath, $metadata['filename'])) {
            unlink($tempFinalPath);
            $this->cleanupChunks($uploadId);
            throw new \Exception('Invalid file type detected via Magic Number');
        }
        
        // Sandbox Malicious File Detection
        if (!$this->sandboxScanner->scan($tempFinalPath)) {
            unlink($tempFinalPath);
            $this->cleanupChunks($uploadId);
            throw new \Exception('Malicious file signature detected by Sandbox');
        }
        
        // MD5 Checksum Deduplication
        $actualChecksum = md5_file($tempFinalPath);
        
        $finalFilename = $actualChecksum . '_' . basename($metadata['filename']);
        $finalPath = $finalDir . '/' . $finalFilename;
        
        // If file already exists, it's a duplicate. We just return its path.
        if (!file_exists($finalPath)) {
            rename($tempFinalPath, $finalPath);
        } else {
            unlink($tempFinalPath); // Delete the redundant upload
        }
        
        $this->cleanupChunks($uploadId);
        
        $metadata['status'] = 'completed';
        $metadata['final_path'] = $finalPath;
        $this->redis->hset("upload:$uploadId", 'metadata', json_encode($metadata));
        
        return [
            'status' => 'completed',
            'path' => '/uploads/storage/' . $dateDir . '/' . $finalFilename,
            'checksum' => $actualChecksum
        ];
    }
    
    /** Returns current upload status and an array of received chunk indices. */
    public function getStatus(string $uploadId): array
    {
        $metadataStr = $this->redis->hget("upload:$uploadId", 'metadata');
        if (!$metadataStr) {
            return ['status' => 'not_found'];
        }
        
        $metadata = json_decode($metadataStr, true);
        if ($metadata['status'] === 'completed') {
            return [
                'status' => 'completed',
                'path' => $metadata['final_path'] ?? null
            ];
        }
        
        $receivedChunks = $this->redis->smembers("upload:$uploadId:chunks");
        return [
            'status' => 'uploading',
            'received_chunks' => array_map('intval', $receivedChunks),
            'total_chunks' => $metadata['total_chunks']
        ];
    }
    
    /** Cleans up temporary chunk files. */
    private function cleanupChunks(string $uploadId): void
    {
        $chunkDir = $this->tempDir . '/' . $uploadId;
        if ($this->filesystem->exists($chunkDir)) {
            $this->filesystem->remove($chunkDir);
        }
    }

    /** Validates file mime type using finfo. */
    private function validateMagicNumber(string $filePath, string $originalFilename): bool
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        
        // Only allow image/* and video/*
        if (strpos($mimeType, 'image/') === 0 || strpos($mimeType, 'video/') === 0) {
            return true;
        }
        
        return false;
    }
}
