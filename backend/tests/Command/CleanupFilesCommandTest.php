<?php

namespace App\Tests\Command;

use App\Command\CleanupFilesCommand;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

class CleanupFilesCommandTest extends TestCase
{
    private string $tempDir;

    protected function setUp(): void
    {
        $this->tempDir = sys_get_temp_dir() . '/cleanup_test';
        if (!is_dir($this->tempDir)) {
            mkdir($this->tempDir, 0777, true);
        }
    }

    protected function tearDown(): void
    {
        $fs = new \Symfony\Component\Filesystem\Filesystem();
        $fs->remove($this->tempDir);
    }

    public function testExecuteDeletesOldFiles(): void
    {
        $storageDir = $this->tempDir . '/var/uploads/storage';
        mkdir($storageDir, 0777, true);

        // Create an old file
        $oldFile = $storageDir . '/old.txt';
        file_put_contents($oldFile, 'old data');
        touch($oldFile, time() - (31 * 86400)); // 31 days old

        // Create a new file
        $newFile = $storageDir . '/new.txt';
        file_put_contents($newFile, 'new data');
        touch($newFile, time() - (1 * 86400)); // 1 day old

        $application = new Application();
        $application->add(new CleanupFilesCommand($this->tempDir));

        $command = $application->find('app:cleanup-files');
        $commandTester = new CommandTester($command);
        $commandTester->execute([]);

        $output = $commandTester->getDisplay();
        $this->assertStringContainsString('Cleanup complete', $output);

        // Assert old file is deleted
        $this->assertFileDoesNotExist($oldFile);

        // Assert new file remains
        $this->assertFileExists($newFile);
    }
}
