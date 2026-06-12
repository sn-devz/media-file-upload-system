<?php

namespace App\Tests\Service;

use App\Security\SandboxScanner;
use App\Service\UploadManager;
use PHPUnit\Framework\TestCase;
use Predis\Client;
use Symfony\Component\Filesystem\Filesystem;

class FakeRedisClient extends Client {
    public function hget($k, $f) {}
    public function hset($k, $f, $v) {}
    public function expire($k, $s) {}
    public function sadd($k, $v) {}
    public function smembers($k) {}
    public function del($k) {}
}

class UploadManagerTest extends TestCase
{
    private UploadManager $uploadManager;
    private string $projectDir;
    private $sandboxScannerMock;

    protected function setUp(): void
    {
        $this->projectDir = sys_get_temp_dir() . '/upload_manager_test';
        $this->sandboxScannerMock = $this->createMock(SandboxScanner::class);
        $this->sandboxScannerMock->method('scan')->willReturn(true);

        $this->uploadManager = new UploadManager($this->projectDir, $this->sandboxScannerMock);
        
        $redisMock = $this->createMock(FakeRedisClient::class);
            
        $redisMock->method('hget')->willReturn(json_encode([
            'filename' => 'test.jpg',
            'total_chunks' => 2,
            'total_size' => 2000,
            'checksum' => 'fakehash',
            'status' => 'pending'
        ]));
        $redisMock->method('smembers')->willReturn(['0', '1']);

        $reflection = new \ReflectionClass(UploadManager::class);
        $property = $reflection->getProperty('redis');
        $property->setValue($this->uploadManager, $redisMock);
    }

    protected function tearDown(): void
    {
        $fs = new Filesystem();
        if ($fs->exists($this->projectDir)) {
            $fs->remove($this->projectDir);
        }
    }

    public function testInitiate()
    {
        $redisMock = $this->createMock(FakeRedisClient::class);
        $redisMock->expects($this->once())->method('hset');
        $redisMock->expects($this->once())->method('expire');
        
        $reflection = new \ReflectionClass(UploadManager::class);
        $property = $reflection->getProperty('redis');
        $property->setValue($this->uploadManager, $redisMock);

        $uploadId = $this->uploadManager->initiate('test.jpg', 2, 2000, 'hash');
        $this->assertStringStartsWith('upl_', $uploadId);
    }

    public function testHandleChunk()
    {
        $redisMock = $this->createMock(FakeRedisClient::class);
        $redisMock->method('hget')->willReturn(json_encode(['metadata' => 'exists']));
        $redisMock->expects($this->once())->method('sadd');
        
        $reflection = new \ReflectionClass(UploadManager::class);
        $property = $reflection->getProperty('redis');
        $property->setValue($this->uploadManager, $redisMock);

        $result = $this->uploadManager->handleChunk('test_id', 0, 'chunkdata');
        $this->assertTrue($result);
        $this->assertFileExists($this->projectDir . '/var/uploads/temp/test_id/0');
    }

    public function testFinalize()
    {
        $uploadId = 'test_id';
        
        // Create fake chunks
        $chunkDir = $this->projectDir . '/var/uploads/temp/' . $uploadId;
        $fs = new Filesystem();
        $fs->mkdir($chunkDir);
        // Create valid fake image data (Magic number detection requires valid header or we override it)
        // Let's use a simple fake JPG header
        $fakeJpg = "\xFF\xD8\xFF\xE0\x00\x10\x4A\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00";
        file_put_contents($chunkDir . '/0', $fakeJpg);
        file_put_contents($chunkDir . '/1', "part2");

        $uploadManagerMock = new UploadManager($this->projectDir, $this->sandboxScannerMock);

        $redisMock = $this->createMock(FakeRedisClient::class);
        $redisMock->method('hget')->willReturn(json_encode([
            'filename' => 'test.jpg',
            'total_chunks' => 2,
            'total_size' => 2000,
            'checksum' => 'fakehash',
            'status' => 'pending'
        ]));
        $redisMock->method('smembers')->willReturn(['0', '1']);
        
        $reflection = new \ReflectionClass(UploadManager::class);
        $property = $reflection->getProperty('redis');
        $property->setValue($uploadManagerMock, $redisMock);

        $result = $uploadManagerMock->finalize($uploadId);
        
        $this->assertEquals('completed', $result['status']);
        $this->assertArrayHasKey('path', $result);
    }

    public function testGetStatus()
    {
        $status = $this->uploadManager->getStatus('test_id');
        $this->assertEquals('uploading', $status['status']);
        $this->assertCount(2, $status['received_chunks']);
    }
}
