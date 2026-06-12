<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

#[AsCommand(
    name: 'app:cleanup-uploads',
    description: 'Cleans up incomplete chunks older than 30 minutes and final files older than 30 days',
)]
class CleanupCommand extends Command
{
    private string $tempDir;
    private string $storageDir;
    private Filesystem $filesystem;

    public function __construct(string $projectDir)
    {
        $this->tempDir = $projectDir . '/var/uploads/temp';
        $this->storageDir = $projectDir . '/var/uploads/storage';
        $this->filesystem = new Filesystem();
        
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('Starting cleanup...');

        // 1. Cleanup incomplete chunks older than 30 minutes
        if ($this->filesystem->exists($this->tempDir)) {
            $finderTemp = new Finder();
            $finderTemp->directories()->in($this->tempDir)->date('< now - 30 minutes');
            
            $removedChunks = 0;
            foreach ($finderTemp as $dir) {
                $this->filesystem->remove($dir->getRealPath());
                $removedChunks++;
            }
            $output->writeln("Removed $removedChunks incomplete upload directories.");
            
            // Also cleanup standalone files in temp dir older than 30 minutes (like temp reassembled files)
            $finderTempFiles = new Finder();
            $finderTempFiles->files()->in($this->tempDir)->depth('== 0')->date('< now - 30 minutes');
            foreach ($finderTempFiles as $file) {
                $this->filesystem->remove($file->getRealPath());
            }
        }

        // 2. Cleanup final files older than 30 days
        if ($this->filesystem->exists($this->storageDir)) {
            $finderFinal = new Finder();
            $finderFinal->files()->in($this->storageDir)->date('< now - 30 days');
            
            $removedFiles = 0;
            foreach ($finderFinal as $file) {
                $this->filesystem->remove($file->getRealPath());
                $removedFiles++;
            }
            $output->writeln("Removed $removedFiles old final files.");
            
            // Cleanup empty date directories
            $finderDirs = new Finder();
            $finderDirs->directories()->in($this->storageDir);
            foreach ($finderDirs as $dir) {
                $dirFinder = new Finder();
                $dirFinder->files()->in($dir->getRealPath());
                if (!$dirFinder->hasResults()) {
                    $this->filesystem->remove($dir->getRealPath());
                }
            }
        }

        $output->writeln('Cleanup completed.');
        return Command::SUCCESS;
    }
}
