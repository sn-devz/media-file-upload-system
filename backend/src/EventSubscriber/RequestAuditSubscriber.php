<?php

namespace App\EventSubscriber;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class RequestAuditSubscriber implements EventSubscriberInterface
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /** Intercepts incoming HTTP requests to log API audit data. */
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $path = $request->getPathInfo();

        // Only audit logs for our upload API
        if (strpos($path, '/api/upload') === 0) {
            $operation = $request->attributes->get('_route') ?? 'unknown_operation';
            
            $this->logger->info('API Audit Log', [
                'source_ip' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent'),
                'operation_type' => $operation,
                'path' => $path,
                'method' => $request->getMethod()
            ]);
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 0],
        ];
    }
}
