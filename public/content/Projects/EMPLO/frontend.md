# Emplo AI Frontend: The Complete Codebase & Architecture Guide

Welcome to the definitive guide for the Emplo AI Frontend. This application is a unified, production-grade Vite React application that combines marketing landing pages, candidate/employer dashboards, and an advanced AI video-interview module into a single cohesive platform.

Just like the backend guide, this document goes deep into the actual source code, breaking down exactly how the architecture is designed and how you can work with it.

---

## Phase 1: High-Level Project Overview & Tech Stack

This frontend is built for performance, security, and complex real-time interactions (like recording audio/video and monitoring for cheating).

### Core Technologies:
- **Framework**: **React 18** powered by **Vite 5**. Vite is used instead of Webpack because it offers near-instant server starts and lightning-fast Hot Module Replacement (HMR).
- **Language**: **TypeScript**. We use strict typing to catch errors before code is even run.
- **Styling**: **Tailwind CSS v3**. We do not write traditional CSS files; everything is styled using utility classes.
- **UI Components**: **shadcn/ui** (built on Radix Primitives). We don't use heavy component libraries like Material UI. Instead, shadcn gives us accessible, unstyled primitives that we style with Tailwind.
- **Authentication**: **Clerk** (`@clerk/clerk-react`). Handles all user login states and provides the JWT tokens for our backend.
- **Routing**: **React Router v6** (`react-router-dom`).
- **Data Fetching**: **Axios** combined with **React Query** (`@tanstack/react-query`) for caching and syncing server state.

---

## Phase 2: Codebase Structure

If you open the project, here is how the files are organized:

```text
📁 emplo-frontend-main
├── 📁 src/
│   ├── 📁 api/             # Centralized Axios network calls grouped by domain (audio, interview)
│   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 ui/          # Generic shadcn primitives (buttons, dialogs, inputs)
│   │   ├── 📁 auth/        # Clerk ProtectedRoute wrappers
│   │   ├── 📁 landing/     # Marketing and public-facing UI blocks
│   │   └── 📁 interview/   # Specific AI-interview widgets (VideoPanel, Transcripts)
│   ├── 📁 contexts/        # React Context providers (global state)
│   ├── 📁 hooks/           # Custom React hooks (e.g. useAuthAdapter, useProctoringEvents)
│   ├── 📁 pages/           # High-level isolated layout pages matching the Router hierarchy
│   ├── 📁 types/           # Global TypeScript interfaces
│   ├── App.tsx             # The central React Router and entry-point
│   └── main.tsx            # Renders App.tsx into the HTML DOM
├── tailwind.config.ts      # Defines our custom colors (bg-emplo-orange)
├── vite.config.ts          # Vite bundler settings
└── package.json            # NPM dependencies
```

---

## Phase 3: Application Entry & Routing (`App.tsx`)

`App.tsx` is the heart of the frontend. It sets up global providers (like Clerk and React Query) and maps URLs to specific Page components.

```tsx
// src/App.tsx (Simplified Snippet)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import Pages
import Index from "./pages/Index";
import SignInPage from "./pages/SignIn";
import EmployerDashboard from "./pages/EmployerDashboard";
import AIInterview from "./pages/AIInterview";

// Import Custom Security Wrapper
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  return (
    // 1. React Query Provider for data caching
    <QueryClientProvider client={queryClient}>
      
      // 2. Clerk Provider for Authentication
      <ClerkProvider publishableKey={clerkPublishableKey}>
        
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES: Anyone can visit these */}
            <Route path="/" element={<Index />} />
            <Route path="/sign-in/*" element={<SignInPage />} />

            {/* PROTECTED ROUTES: Only logged-in users can visit these */}
            <Route 
              path="/employer" 
              element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/ai-interview/:id" 
              element={
                <ProtectedRoute>
                  <AIInterview />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
        
      </ClerkProvider>
    </QueryClientProvider>
  );
};

export default App;
```

**How it works:**
The `<ClerkProvider>` wraps the entire app, meaning any component inside can call `useAuth()` to get the current user. The `<ProtectedRoute>` is a custom wrapper that checks if a user is logged in; if they aren't, it immediately redirects them to the `/sign-in` page, preventing unauthorized access to the dashboard or interview pages.

---

## Phase 4: API & Networking (`api/client.ts`)

We do not use raw `fetch()` calls scattered across the app. All network requests to the Node.js backend go through a centralized Axios client.

```typescript
// src/api/client.ts
import axios from 'axios';

// Pull the backend URL from the environment variables (e.g., http://localhost:8000)
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// A generic client for public requests
export const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL,
});

// A factory function to create a secure client using the user's Clerk Token
export const getAuthClient = (token: string) => {
  return axios.create({
    baseURL: VITE_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}` // This matches what our backend auth.js expects!
    }
  });
};

export const getBaseUrl = () => VITE_API_BASE_URL;
```

**How it works:**
When a component needs to fetch data, it imports `getAuthClient`. It passes the current user's JWT token (retrieved via Clerk's `useAuth()` hook) into this function. The resulting Axios instance automatically attaches the `Authorization: Bearer <token>` header to every single request made.

---

## Phase 5: The AI Interview Architecture (`AIInterview.tsx`)

The `/ai-interview/:id` route is a massive, complex page. It manages video recording, audio playback, background video uploading, and live proctoring (anti-cheating).

Let's look at how advanced the architecture is, specifically the auto-recovery system for crashed browsers:

```tsx
// src/pages/AIInterview.tsx (Snippet highlighting Auto-Recovery)
import { useState, useEffect, useRef } from 'react';
import { useAuthAdapter as useAuth } from '@/hooks/useAuthAdapter';
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { useFaceDetection } from '@/hooks/proctoring/useFaceDetection';
import { useTabMonitor } from '@/hooks/proctoring/useTabMonitor';

const AIInterview = () => {
  const { user, getFreshToken } = useAuth();
  
  // Custom hooks that listen to the browser and webcam for cheating
  useTabMonitor(); // Fires if user switches tabs
  useFaceDetection(); // Fires if multiple faces or no faces are seen

  // Background upload stream to AWS S3 / Backblaze B2
  const bgUpload = useBackgroundUpload(getFreshToken);

  // Auto-recovery of crashed/unfinished uploads runs ONCE on mount.
  useEffect(() => {
    const checkAndRecover = async () => {
      // 1. Get cached interview data from IndexedDB (local browser storage)
      const { getAllCachedInterviewIds, getCachedRecording } = await import('@/api/interviewCache');
      const cachedIds = await getAllCachedInterviewIds();
      
      for (const cachedId of cachedIds) {
        const record = await getCachedRecording(cachedId);
        
        // 2. If the user crashed MID-interview, we silently delete the local cache 
        // so they can start fresh.
        if (!record.isComplete) {
           await deleteCachedRecording(cachedId);
           continue;
        }

        // 3. If the user COMPLETED the interview, but their internet crashed 
        // before the video finished uploading, we resume the upload!
        console.log('Found completed interview with pending upload, recovering...');
        
        const presignToken = await getFreshToken();
        // ... Logic to request new AWS S3 Presigned URLs and upload the remaining chunks ...
      }
    };
    checkAndRecover();
  }, []);

  return (
    <div>
       {/* Renders the Video feed, Transcript, and live Proctoring overlays */}
    </div>
  );
};
```

**How it works:**
1. **Custom Proctoring Hooks**: `useTabMonitor` and `useFaceDetection` are constantly running in the background. If they detect anomalies, they add events to an array which is eventually batched and sent to the backend's `/proctoring` endpoint.
2. **IndexedDB Caching**: Because video files are huge, holding them in memory (RAM) would crash the browser. Instead, video chunks are cached directly to the browser's hard drive (IndexedDB) via `interviewCache.ts`.
3. **Crash Recovery**: If the candidate's laptop dies right as the interview finishes, the `useEffect` on reload checks the hard drive. If it finds an unfinished upload of a completed interview, it quietly resumes the upload to the cloud without making the candidate re-take the interview!

---

## Phase 6: Styling & UI Components

We use a combination of **Tailwind CSS** and **shadcn/ui**. 

### 6.1 Tailwind Configuration
Instead of hardcoding hex colors like `#ff5722` in our classes, we use a central design token system defined in `tailwind.config.ts`.

```typescript
// tailwind.config.ts (Snippet)
module.exports = {
  theme: {
    extend: {
      colors: {
        emplo: {
          orange: '#F97316', // Primary brand color
          text: '#1F2937',
        }
      }
    }
  }
}
```
*Usage in a React Component:*
```tsx
<button className="bg-emplo-orange text-white px-4 py-2 rounded">
  Apply Now
</button>
```

### 6.2 shadcn/ui
We do not install shadcn as an NPM package. Instead, shadcn components are copy-pasted directly into our `src/components/ui` folder. This means we have 100% control over their code.

For example, if you look at `src/components/ui/button.tsx`, you will see exactly how the `Button` component is built using Radix primitives and styled with Tailwind. This allows us to modify the core behavior of standard inputs without fighting against a rigid 3rd-party library.

---

**You now have a complete, code-level understanding of the Emplo AI Frontend!** 🚀
By utilizing Vite, Clerk, Tailwind, and React Router, this architecture scales beautifully while maintaining complex browser-level functionality like live video processing and crash recovery.
