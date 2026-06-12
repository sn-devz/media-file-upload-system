# Backend - Media Upload System

This is the PHP/Symfony backend for the media upload assignment. It handles receiving chunked file uploads from clients, storing state in Redis, and reassembling the files once all chunks are uploaded.

## Requirements

- PHP 8.2+
- Composer
- Local Redis instance running on port 6379

## Installation

1. Install & Start Redis:
   - **macOS:** `brew install redis` then `brew services start redis`
   - **Ubuntu/Debian:** `sudo apt install redis-server` then `sudo systemctl start redis-server`
   - **Docker:** `docker run -d -p 6379:6379 redis`

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Start the development server:
   ```bash
   php -S 127.0.0.1:8000 -t public
   ```

## Endpoints

The upload flow uses a chunking strategy to handle large files and network drops.

**POST `/api/upload/initiate`**
Registers a new upload session in Redis.
- Payload: `{ "filename": "test.mp4", "total_chunks": 5, "total_size": 5000000, "checksum": "hash" }`
- Returns: `{ "upload_id": "upl_123", "status": "pending" }`

**POST `/api/upload/chunk/{uploadId}`**
Receives a specific binary chunk (multipart/form-data).
- Fields: `chunk_index` (int), `chunk` (file blob)

**POST `/api/upload/finalize/{uploadId}`**
Called when the client finishes sending all chunks. Reassembles the file and runs security checks.

**GET `/api/upload/status/{uploadId}`**
Returns the array of successfully received chunk indexes. Used by the client to resume interrupted uploads.

## Security & Cleanup

- **Rate Limiter:** Limits clients to 10 uploads per minute per IP.
- **Sandbox Scanner:** Basic heuristic scan during finalization. Blocks files containing `<?php` or `eval()`.
- **Audit Logs:** Requests to `/api/upload` are logged to `var/log/` with IP and User-Agent data. Logs rotate daily (30-day retention).

**Cleanup Cron:**
Temp chunks and old files are handled by a console command. Run this manually or via crontab:
```bash
php bin/console app:cleanup-files
```

## Running Tests

The test suite covers the controllers, services, commands, and security scanners.

**Unit Tests (PHPUnit):**
```bash
vendor/bin/phpunit --testdox
```

**Load Testing (k6):**
A basic k6 script is included to test concurrent chunk uploads.
```bash
k6 run stress-test.js
```
