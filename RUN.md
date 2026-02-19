# Build2Gether - Erosion Report Management System

Build2Gether is a modern web application designed for monitoring soil health and reporting erosion issues. It features real-time geolocation, offline support, and a responsive dashboard for reporters and supervisors.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- A **Firebase** project
- A **Cloudinary** account (for free tier image storage)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# Cloudinary Configuration (For Image Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_unsigned_preset"
```

> **Note:** To set up Cloudinary, go to **Settings > Upload**, add a new **Unsigned** upload preset, and copy its name.

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 5. Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Cloudinary (Images)
- **State/Caching:** IndexedDB (for offline reports)
- **UI Components:** Radix UI / Shadcn UI primitives

## 📱 Features
- **Responsive Design:** Optimized for mobile, tablet, and desktop.
- **Real-time Reporting:** Captured images are uploaded to Cloudinary, and metadata is saved to Firestore.
- **Offline Support:** Reports are saved to IndexedDB when offline and can be synced later.
- **Supervisor Dashboard:** Role-based access for reviewing and approving reports.
- **Progressive UI:** Clean, modern interface with glassmorphism and subtle animations.

## 📄 License
This project is licensed under the MIT License.
