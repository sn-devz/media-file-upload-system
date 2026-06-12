# Architecture & Technical Decisions

This document outlines how the Media File Upload System is structured across its three core components (Web, Mobile, Backend) and explains the technical reasoning behind our implementation.

## System Overview

The core problem this system solves is reliably moving large files (up to hundreds of megabytes or gigabytes) from unpredictable client environments (like a shaky mobile 3G connection) to a central server without failing, timing out, or corrupting data.

To solve this, we used a **Chunking Strategy**. Files are sliced into 1MB chunks on the client side. If a network drops during chunk 45, the system doesn't need to restart the entire upload; it just retries chunk 45.

---

## 1. Web Frontend (Next.js / React)

**What we did:**
We built a responsive SPA using Next.js, React 18, and TailwindCSS. We used Zustand for global state management and Ant Design for the UI components (progress bars, lists, toasts).

**Why we did it:**
- **Zustand over Context/Redux:** Uploading files is a background task. If we used React Context, every progress tick (which happens hundreds of times a second for fast uploads) would trigger a massive re-render tree. Zustand allows us to update the progress state outside the React render cycle, keeping the UI smooth.
- **Local Storage Persistence:** We use Zustand's `persist` middleware to save the `uploadId` and the array of `uploadedChunks` into `localStorage`. If the user accidentally refreshes the page, they can drag-and-drop the file again, and the system will instantly skip the chunks it already uploaded.
- **Thumbnail Optimization:** Initially, reading large 50MB images into memory to generate a preview thumbnail froze the browser's UI thread. We built a custom utility using `URL.createObjectURL()` to instantly render the image onto an invisible HTML `<canvas>`, downscale it to a tiny Base64 string, and clear the memory. This prevents browser lockups.

## 2. Mobile App (React Native / Expo)

**What we did:**
We built a cross-platform mobile client using Expo, leveraging native modules for camera access, file picking, and background execution. 

**Why we did it:**
- **Background Fetch:** Mobile OSes (iOS and Android) aggressively kill apps in the background to save battery. We integrated `expo-background-fetch` so that if a user minimizes the app while uploading a 500MB video, the OS will occasionally wake the app up to send more chunks in the background.
- **File System Chunking:** React Native's bridge struggles with transferring massive blobs of data from native storage to JavaScript memory. We read the file in 1MB streams directly off the disk using `expo-file-system`, preventing Out-Of-Memory (OOM) crashes on older phones.
- **Exponential Backoff:** Mobile networks are notoriously flaky. We built an automatic retry loop that waits longer after each failure (1s, 2s, 4s) before giving up, which gives the user time to walk out of an elevator or tunnel without the upload completely failing.

## 3. Backend API (PHP / Symfony 6)

**What we did:**
We built a stateless REST API using Symfony 6 that handles initialization, chunk reception, and file reassembly.

**Why we did it:**
- **Redis for Chunk Tracking:** Instead of writing to a MySQL/PostgreSQL database every time a 1MB chunk arrives, we use Redis. It acts as a blazing-fast, temporary scratchpad to track which chunks have arrived. Relational databases suffer from row-lock contention under heavy concurrent writes, but Redis handles thousands of chunk updates per second effortlessly.
- **Memory-Safe Reassembly:** When the final chunk arrives, the backend needs to stitch 500 separate 1MB files together. Instead of loading 500MB into PHP memory (which would instantly crash the server), we use `stream_copy_to_stream()`. This pipes the data directly across the hard drive, maintaining a flat memory footprint regardless of file size.
- **MD5 Deduplication:** Before initiating an upload, the client sends an MD5 hash of the file. If the server recognizes the hash from a previous upload, it instantly returns a success response and points to the existing file, saving the user from uploading the exact same video twice.
