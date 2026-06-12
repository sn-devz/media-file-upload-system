<?php

namespace App\Tests\Security;

use App\Security\SandboxScanner;
use PHPUnit\Framework\TestCase;

class SandboxScannerTest extends TestCase
{
    private SandboxScanner $scanner;
    private string $tempDir;

    protected function setUp(): void
    {
        $this->scanner = new SandboxScanner();
        $this->tempDir = sys_get_temp_dir() . '/sandbox_test';
        if (!is_dir($this->tempDir)) {
            mkdir($this->tempDir, 0777, true);
        }
    }

    protected function tearDown(): void
    {
        array_map('unlink', glob("$this->tempDir/*.*"));
        rmdir($this->tempDir);
    }

    public function testScanCleanFile(): void
    {
        $file = $this->tempDir . '/clean.txt';
        file_put_contents($file, 'This is a clean text file.');
        
        $this->assertTrue($this->scanner->scan($file));
    }

    public function testScanMaliciousPhpTag(): void
    {
        $file = $this->tempDir . '/bad1.php';
        file_put_contents($file, '<?php echo "Hacked"; ?>');
        
        $this->assertFalse($this->scanner->scan($file));
    }

    public function testScanMaliciousEval(): void
    {
        $file = $this->tempDir . '/bad2.txt';
        file_put_contents($file, 'some text eval(base64_decode(something))');
        
        $this->assertFalse($this->scanner->scan($file));
    }

    public function testScanNonExistentFile(): void
    {
        $this->assertFalse($this->scanner->scan($this->tempDir . '/does_not_exist.txt'));
    }
}
