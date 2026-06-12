<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UploadControllerTest extends WebTestCase
{
    public function testInitiateEndpoint()
    {
        $client = static::createClient();

        $client->request('POST', '/api/upload/initiate', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'filename' => 'test_file.mp4',
            'total_chunks' => 5,
            'total_size' => 5000000,
            'checksum' => 'fake_md5_hash'
        ]));

        $this->assertResponseIsSuccessful();
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('upload_id', $content);
        $this->assertStringStartsWith('upl_', $content['upload_id']);
    }

    public function testRateLimiterEnforcement()
    {
        $client = static::createClient();
        
        // Ensure we hit the limit regardless of other tests
        $limitReached = false;
        for ($i = 0; $i < 15; $i++) {
            $client->request('POST', '/api/upload/initiate', [], [], ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '127.0.0.2'], json_encode([
                'filename' => 'test_file.mp4',
                'total_chunks' => 5,
                'total_size' => 5000000,
                'checksum' => 'fake_md5_hash'
            ]));
            
            if ($client->getResponse()->getStatusCode() === 429) {
                $limitReached = true;
                break;
            }
        }

        $this->assertTrue($limitReached, 'Rate limit was not reached.');
    }
}
