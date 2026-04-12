import { useEffect } from "react";
import { initApiClient } from "@/lib/apiClient";
import { SyncStatusIndicator } from "@/components/SyncStatus";

/**
 * Sync Provider - Initialize the entire sync system
 * Add this to your main.tsx before rendering the app
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the API client
    initApiClient({
      baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      batchSize: 10,
    });

    console.log("🔄 Sync System Initialized");
  }, []);

  return (
    <>
      {children}
      <SyncStatusIndicator />
    </>
  );
}

// Usage in main.tsx:
/*
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SyncProvider } from './lib/SyncProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>,
)
*/
