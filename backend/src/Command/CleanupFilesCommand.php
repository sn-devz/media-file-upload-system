<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

#[AsCommand(
    name: 'app:cleanup-files',
    description: 'Cleans up old uploaded files (older than 30 days) and incomplete temp chunks.',
)]
class CleanupFilesCommand extends Command
{
    private string $storageDir;
    private string $tempDir;
    private Filesystem $filesystem;

    public function __construct(string $projectDir)
    {
        parent::__construct();
        $this->storageDir = $projectDir . '/var/uploads/storage';
        $this->tempDir = $projectDir . '/var/uploads/temp';
        $this->filesystem = new Filesystem();
    }

    /** Executes the cleanup process to remove old storage and temp files. */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('Starting file cleanup process...');

        $finder = new Finder();
        
        // 1. Clean up Storage files older than 30 days
        if ($this->filesystem->exists($this->storageDir)) {
            $finder->files()->in($this->storageDir)->date('< now - 30 days');
            $count = 0;
            foreach ($finder as $file) {
                $this->filesystem->remove($file->getRealPath());
                $count++;
            }
            $output->writeln("Removed $count files older than 30 days from storage.");
        }

        // 2. Clean up temporary chunks older than 30 minutes
        $tempFinder = new Finder();
        if ($this->filesystem->exists($this->tempDir)) {
            // Find directories (upload sessions) older than 30 minutes
            $tempFinder->directories()->in($this->tempDir)->date('< now - 30 minutes');
            $tempCount = 0;
            foreach ($tempFinder as $dir) {
                $this->filesystem->remove($dir->getRealPath());
                $tempCount++;
            }
            $output->writeln("Removed $tempCount incomplete upload temp directories older than 30 minutes.");
            
            // Also clean up any lingering temporary reassembled files ending in _final older than 30 minutes
            $tempFilesFinder = new Finder();
            $tempFilesFinder->files()->in($this->tempDir)->name('*_final')->date('< now - 30 minutes');
            foreach ($tempFilesFinder as $file) {
                $this->filesystem->remove($file->getRealPath());
            }
        }

        $output->writeln('Cleanup completed successfully.');

        return Command::SUCCESS;
    }
}
