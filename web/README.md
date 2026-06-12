# Media File Upload System (Web)

A Next.js web frontend for the media file upload system. It supports chunked file uploads, resumable uploads, and concurrent processing.

## Features

- Chunked uploads (1MB chunks)
- Local state persistence for resuming uploads
- Max 3 concurrent uploads
- Exponential backoff retries for network failures
- Drag-and-drop file picker
- Automatic image thumbnail generation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Testing

```bash
npm run test
```
