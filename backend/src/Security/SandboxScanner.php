<?php

namespace App\Security;

class SandboxScanner
{
    /** Scans a file for malicious PHP/eval signatures. */
    public function scan(string $filePath): bool
    {
        if (!file_exists($filePath)) {
            return false;
        }

        $contents = file_get_contents($filePath);

        // Simulated malicious signatures
        $maliciousSignatures = [
            '<?php', // Embedded PHP tags in images
            'eval(',
            'base64_decode(',
            'system(',
            'exec('
        ];

        foreach ($maliciousSignatures as $signature) {
            if (stripos($contents, $signature) !== false) {
                // Malicious signature detected
                return false;
            }
        }

        // Return true if file is safe
        return true;
    }
}
