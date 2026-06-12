<?php

namespace App\Controller;

use App\Service\UploadManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

#[Route('/api/upload')]
class UploadController extends AbstractController
{
    private UploadManager $uploadManager;
    private RateLimiterFactory $uploadApiLimiter;

    public function __construct(UploadManager $uploadManager, RateLimiterFactory $uploadApiLimiter)
    {
        $this->uploadManager = $uploadManager;
        $this->uploadApiLimiter = $uploadApiLimiter;
    }

    /** Initializes a new upload session and returns an upload ID. */
    #[Route('/initiate', name: 'upload_initiate', methods: ['POST'])]
    public function initiate(Request $request): JsonResponse
    {
        if (!in_array($request->getClientIp(), ['127.0.0.1', '::1'])) {
            $limiter = $this->uploadApiLimiter->create($request->getClientIp());
            if (false === $limiter->consume()->isAccepted()) {
                throw new TooManyRequestsHttpException('Rate limit exceeded. Max 10 requests per minute.');
            }
        }

        $data = json_decode($request->getContent(), true);
        
        $filename = $data['filename'] ?? null;
        $totalChunks = $data['total_chunks'] ?? null;
        $totalSize = $data['total_size'] ?? null;
        $checksum = $data['checksum'] ?? null;
        
        if (!$filename || $totalChunks === null || $totalSize === null) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }
        
        try {
            $uploadId = $this->uploadManager->initiate($filename, (int)$totalChunks, (int)$totalSize, (string)$checksum);
            return $this->json(['upload_id' => $uploadId]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /** Receives and stores a single file chunk by index. */
    #[Route('/chunk/{uploadId}', name: 'upload_chunk', methods: ['POST'])]
    public function uploadChunk(string $uploadId, Request $request): JsonResponse
    {
        if (!in_array($request->getClientIp(), ['127.0.0.1', '::1'])) {
            $limiter = $this->uploadApiLimiter->create($request->getClientIp());
            if (false === $limiter->consume()->isAccepted()) {
                throw new TooManyRequestsHttpException('Rate limit exceeded. Max 10 requests per minute.');
            }
        }

        $chunkIndex = $request->request->get('chunk_index');
        $file = $request->files->get('chunk');
        
        if ($chunkIndex === null || !$file) {
            return $this->json(['error' => 'Missing chunk index or file data'], 400);
        }
        
        try {
            $chunkData = file_get_contents($file->getPathname());
            $this->uploadManager->handleChunk($uploadId, (int)$chunkIndex, $chunkData);
            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /** Merges chunks, runs security scans, and finalizes the upload. */
    #[Route('/finalize/{uploadId}', name: 'upload_finalize', methods: ['POST'])]
    public function finalize(string $uploadId): JsonResponse
    {
        try {
            $result = $this->uploadManager->finalize($uploadId);
            return $this->json($result);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    /** Retrieves current upload progress and missing chunks. */
    #[Route('/status/{uploadId}', name: 'upload_status', methods: ['GET'])]
    public function status(string $uploadId): JsonResponse
    {
        $status = $this->uploadManager->getStatus($uploadId);
        return $this->json($status);
    }
}
