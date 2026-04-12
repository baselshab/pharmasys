/**
 * Integration Guide: Frontend API Client with Backend
 * 
 * This guide explains how to integrate the new API client with your Frontend
 * and Backend for seamless Online/Offline support.
 */

// ================================================
// 1. SETUP - Initialize API Client
// ================================================
/*
In your main.tsx or App.tsx, initialize the API client:

import { initApiClient } from "@/lib/apiClient";

initApiClient({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 10,
});
*/

// ================================================
// 2. ENVIRONMENT VARIABLES - Add to .env
// ================================================
/*
# Backend API URL
VITE_API_URL=http://localhost:4000/api

# Or for production
VITE_API_URL=https://api.pharmasys.com/api
*/

// ================================================
// 3. AUTHENTICATION - Store User Info
// ================================================
/*
When user logs in, store their info in localStorage:

function handleLogin(user) {
  localStorage.setItem("user_id", user.id);
  localStorage.setItem("user_role", user.role);
  localStorage.setItem("pharmacy_id", user.pharmacyId);
  
  // Redirect to dashboard
}
*/

// ================================================
// 4. USAGE EXAMPLES IN COMPONENTS
// ================================================

// Example 1: Fetch data with automatic caching
/*
import { useApiData } from "@/hooks/useApi";

function ProductsList() {
  const { data: products, loading, error, refetch } = useApiData(
    "/products",
    {
      autoFetch: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={refetch}>تحديث</button>
    </div>
  );
}
*/

// Example 2: Create with automatic sync
/*
import { useMutation } from "@/hooks/useApi";

function AddCustomer() {
  const { mutate, loading } = useMutation("POST");

  async function handleSubmit(formData) {
    const response = await mutate("/customers", formData, {
      onSuccess: () => {
        console.log("تم حفظ الزبون بنجاح");
      },
      onError: (error) => {
        console.log("الخطأ:", error);
      }
    });

    // If offline, data is saved locally and synced when online
    if (!response.success) {
      console.log("تم الحفظ محليًا وسيتم المزامنة");
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.target));
    }}>
      {/* Form fields */}
<button disabled={ loading }>
  { loading? "جاري الحفظ...": "حفظ" }
  </button>
  </form>
  );
}
*/

// Example 3: Use new API hooks instead of local database
/*
import { useCustomersApi } from "@/hooks/useCustomersApi";

function CustomersPage() {
  const {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isOnline,
    hasUnsyncedChanges,
  } = useCustomersApi();

  // Now you can use this instead of useCustomers()
  // It will automatically work offline and sync online
}
*/

// Example 4: Display sync status
/*
import { SyncStatusIndicator, SyncStatusBadge } from "@/components/SyncStatus";

function AppLayout() {
  return (
    <div>
      {/* Show in navbar */}
<header>
  <SyncStatusBadge />
  </header>

{/* Show floating indicator */ }
<SyncStatusIndicator />

{/* Rest of app */ }
</div>
  );
}
*/

// ================================================
// 5. MIGRATION STRATEGY
// ================================================
/*
Gradual migration from old hooks to new API hooks:

OLD (SQLite only):
export function useCustomers() {
  const { db, isReady } = useDatabase();
  // ... sqlite logic
}

NEW (API + Sync):
export function useCustomersApi() {
  const { data, loading, refetch } = useApiData("/customers");
  // ... api logic with auto-sync
}

DURING TRANSITION:
You can keep both hooks and gradually replace:
1. Create new API hooks (done)
2. Update pages one by one
3. Keep old hooks as fallback
4. Remove old hooks once migration complete
*/

// ================================================
// 6. HOW IT WORKS - ONLINE/OFFLINE FLOW
// ================================================
/*
ONLINE MODE:
1. User fills form and submits
2. Request sent to backend immediately
3. Response received and displayed
4. Data synced to localStorage for offline backup

OFFLINE MODE:
1. User fills form and submits
2. Request queued locally in localStorage
3. User sees "تم الحفظ محليًا" message
4. Data also saved to SQLite for backup
5. Sync queue retained in localStorage

WHEN COMING ONLINE:
1. App detects connection restored
2. Automatically starts syncing queue
3. Sends all pending requests in batches
4. Updates UI when each request succeeds
5. Shows notifications for success/failure
6. Clears queue when all synced
*/

// ================================================
// 7. CONFIGURATION & CUSTOMIZATION
// ================================================
/*
API Client Configuration (apiClient.ts):
- maxRetries: 3 (number of retry attempts)
- retryDelay: 1000 (ms between retries)
- batchSize: 10 (how many requests per batch)
- baseUrl: Backend API URL
- timeout: 10000 (request timeout in ms)

Customize in initApiClient():
export function initApiClient(config?: Partial<SyncConfig>): ApiClient {
  initApiClient({
    maxRetries: 5,
    retryDelay: 2000,
    batchSize: 20,
  });
}
*/

// ================================================
// 8. ERROR HANDLING
// ================================================
/*
// Handle different error types:

async function fetchData() {
  const { data, error } = await api.get("/products");

  if (error === "offline_saved") {
    // Data saved locally, will sync when online
    showNotification("تم الحفظ محليًا");
  } else if (error?.includes("404")) {
    // Not found error
    showNotification("لم يتم العثور على البيانات");
  } else if (error?.includes("401")) {
    // Unauthorized - redirect to login
    redirectToLogin();
  } else if (error) {
    // Unknown error
    showNotification("حدث خطأ: " + error);
  }
}
*/

// ================================================
// 9. TESTING
// ================================================
/*
// Test offline functionality:
1. Open DevTools > Network tab
2. Set throttling to "Offline"
3. Try adding/editing data
4. Should see "تم الحفظ محليًا" message
5. Toggle back to Online
6. Should auto-sync and show success

// Test API endpoints:
curl -X GET http://localhost:4000/api/products \
  -H "x-user-id: user-123" \
  -H "x-user-role: admin" \
  -H "x-pharmacy-id: ph-001"
*/

// ================================================
// 10. BACKEND REQUIREMENTS
// ================================================
/*
Make sure backend has:
✅ CORS enabled (done in backend/index.ts)
✅ At least these headers supported:
   - x-user-id
   - x-user-role
   - x-pharmacy-id
✅ Consistent HTTP status codes
✅ JSON response format

Backend already configured and ready!
*/

// ================================================
// 11. COMPONENTS TO ADD TO LAYOUT
// ================================================
/*
Add to AppLayout.tsx or main layout:

import { SyncStatusIndicator, SyncStatusBadge } from "@/components/SyncStatus";

export function AppLayout() {
  return (
    <>
      <header className="flex items-center justify-between">
        {/* existing header content */}
<SyncStatusBadge /> {/ * Shows connection status in navbar */}
</header>

  <main>
{/* page content */ }
</main>

  < SyncStatusIndicator /> {/* Shows floating sync indicator */ }
  </>
  );
}
*/

// ================================================
// 12. NEXT STEPS
// ================================================
/*
1. Initialize API Client in main.tsx
2. Add SyncStatus components to layout
3. Start replacing old hooks with new API hooks
4. Test offline functionality
5. Deploy to production

For help, see the examples above or check:
- /src/lib/apiClient.ts (main implementation)
- /src/hooks/useApi.ts (React hooks)
- /src/hooks/useCustomersApi.ts (example API hook)
- /src/components/SyncStatus.tsx (UI components)
- ../API_GUIDE.md (full backend API documentation)
*/

export const INTEGRATION_GUIDE = "See implementation details above";
