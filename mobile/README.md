# Mobile Uploader App

A high-performance React Native application for managing file and media uploads, with background fetching, chunking, and push notification support.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Watchman](https://facebook.github.io/watchman/docs/install) (for macOS users)

## Setup & Installation

1. **Install Dependencies**
   Navigate to the `mobile` directory and install the necessary packages:
   ```bash
   npm install
   ```
   *(or `yarn install` if you prefer Yarn)*

2. **Configure Environment**
   By default, the app is configured to point to a local backend API. 
   If you are running the backend on your computer, the app automatically detects if you are on an Android emulator (`10.0.2.2`) or iOS simulator (`localhost`). You can verify this in `src/services/apiService.ts`.

## Running the Application

### Using Expo Go (Quick Start)
To run the app locally inside the Expo Go sandbox app:
```bash
npx expo start
```
- **iOS**: Press `i` in the terminal to open the iOS Simulator.
- **Android**: Press `a` in the terminal to open the Android Emulator.
- **Physical Device**: Scan the QR code using the Expo Go app on your phone.

*Note: Background Fetch and Push Notifications are partially restricted by Apple/Google inside the Expo Go sandbox app. To fully test these features, you must use a Development Build.*

### Creating a Development Build (Recommended)
To fully utilize Native modules like Push Notifications and Background Tasks, build a standalone client:

**For iOS:**
```bash
npx expo run:ios
```
*(Requires Xcode installed on macOS)*

**For Android:**
```bash
npx expo run:android
```
*(Requires Android Studio installed)*

## Features
- **Chunked Uploads:** Automatically splits large files into 1MB chunks to ensure reliable network delivery.
- **Concurrent Queueing:** Manages multiple uploads simultaneously (default: 3 concurrent streams).
- **Background Support:** Utilizes `expo-background-fetch` to seamlessly resume uploads if the app is minimized.
- **Local Notifications:** Alerts the user natively when an upload reaches 100% completion.
