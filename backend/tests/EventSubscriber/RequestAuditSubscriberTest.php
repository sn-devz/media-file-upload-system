<?php

namespace App\Tests\EventSubscriber;

use App\EventSubscriber\RequestAuditSubscriber;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class RequestAuditSubscriberTest extends TestCase
{
    public function testOnKernelRequestLogsApiCall(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->once())
            ->method('info')
            ->with('API Audit Log', $this->callback(function ($context) {
                return $context['source_ip'] === '192.168.1.1' &&
                       $context['user_agent'] === 'TestAgent' &&
                       $context['operation_type'] === 'upload_initiate' &&
                       $context['path'] === '/api/upload/initiate' &&
                       $context['method'] === 'POST';
            }));

        $subscriber = new RequestAuditSubscriber($logger);

        $request = Request::create('/api/upload/initiate', 'POST', [], [], [], [
            'REMOTE_ADDR' => '192.168.1.1',
            'HTTP_USER_AGENT' => 'TestAgent'
        ]);
        $request->attributes->set('_route', 'upload_initiate');

        $kernel = $this->createMock(HttpKernelInterface::class);
        $event = new RequestEvent($kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $subscriber->onKernelRequest($event);
    }

    public function testOnKernelRequestIgnoresNonApiCall(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->never())->method('info');

        $subscriber = new RequestAuditSubscriber($logger);

        $request = Request::create('/some/other/path', 'GET');
        $kernel = $this->createMock(HttpKernelInterface::class);
        $event = new RequestEvent($kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $subscriber->onKernelRequest($event);
    }

    public function testOnKernelRequestIgnoresSubRequests(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->never())->method('info');

        $subscriber = new RequestAuditSubscriber($logger);

        $request = Request::create('/api/upload/initiate', 'POST');
        $kernel = $this->createMock(HttpKernelInterface::class);
        // Using SUB_REQUEST should be ignored
        $event = new RequestEvent($kernel, $request, HttpKernelInterface::SUB_REQUEST);

        $subscriber->onKernelRequest($event);
    }
}
