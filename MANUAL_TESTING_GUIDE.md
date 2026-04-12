# 🧪 Manual Testing Guide - First Run

**Goal:** Verify all checklist items work correctly  
**Duration:** 15-20 minutes  
**Prerequisites:** Both servers running

---

## 📊 Test Matrix

| Test                | Online/Offline | Creating Added   | Data Queue  | Sync Result         |
| ------------------- | -------------- | ---------------- | ----------- | ------------------- |
| Test 1: Online Add  | Online ✅      | ✅ Expected      | ❌ No queue | ✅ In DB            |
| Test 2: Offline Add | Offline 🛑     | ✅ Expected      | ✅ Queued   | 🕐 Pending          |
| Test 3: Auto Sync   | Online ✅      | N/A (from queue) | ✅ Cleared  | ✅ In DB            |
| Test 4: Retry Logic | Network 🔄     | N/A (from queue) | ✅ Retry    | ✅ Eventually in DB |

---

## ✅ Test 1: Online Operations (5 min)

### Setup

```bash
# Verify both running
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
# Browser: Open http://localhost:8080
```

### Steps

1. **Open Products page**
   - Click "Products" in sidebar
   - Should see empty list or existing products

2. **Add test product (Online)**

   ```
   Name: Test Product 1
   Price: $9.99
   SKU: TEST-001
   Category: General
   ```

3. **Verify**

   ```
   ✅ Form submitted without error
   ✅ Product appears in list immediately
   ✅ No "Offline" indicator visible
   ✅ No queue in localStorage
   ```

4. **Confirm in database**
   ```bash
   # In backend terminal, check logs:
   # Should see: POST /api/products 201 Created
   ```

### Screenshot Checklist

- [ ] Product form visible
- [ ] Product added to list
- [ ] Sync indicator shows "Online"
- [ ] No errors in browser console (F12)

---

## 🛑 Test 2: Offline Operations (5 min)

### Setup

```bash
# Keep both servers running
# Same browser window
```

### Steps

1. **Go Offline**
   - Press F12 (DevTools)
   - Go to **Network** tab
   - Find **Throttling** dropdown
   - Click and select **"Offline"**
   - Press F12 again to close DevTools

2. **Add product (Offline)**

   ```
   Name: Offline Product 1
   Price: $19.99
   SKU: OFF-001
   Category: Emergency
   ```

3. **Verify Offline Behavior**

   ```
   ✅ Form submitted successfully
   ✅ Product appears in local list
   ✅ See "Offline" indicator (red/yellow)
   ✅ See "Pending: 1" in sync badge
   ```

4. **Check localStorage Queue**

   ```javascript
   // Open browser console (F12 → Console)
   // Paste and press Enter:
   JSON.parse(localStorage.getItem("pharmasys_sync_queue"));

   // Expected output:
   // Array with 1 item:
   // {
   //   method: "POST",
   //   url: "/products",
   //   data: { name: "Offline Product 1", ... },
   //   timestamp: 1712930010671,
   //   retries: 0
   // }
   ```

5. **Try refreshing page**
   - Press F5 or Cmd+R
   - Product should STILL be visible (loaded from localStorage)
   - Queue still populated

### Screenshot Checklist

- [ ] "Offline" indicator visible
- [ ] "Pending: 1" showing
- [ ] Product in local list
- [ ] localStorage queue populated

---

## 🔄 Test 3: Automatic Sync (5 min)

### Setup

```bash
# Still offline with queue from Test 2
# Browser still showing Offline product
```

### Steps

1. **Come Online**
   - Press F12 (DevTools)
   - Network tab → Throttling dropdown
   - Change to **"No throttling"**
   - Close DevTools (F12)

2. **Watch Sync Happen**

   ```
   Watch for:
   ✅ "Syncing..." indicator appears
   ✅ Animation/spinner shows
   ✅ Indicator changes to "Online"
   ✅ "Sync complete!" message
   ✅ Pending count goes from 1 → 0
   ```

3. **Verify Data Persisted**

   ```javascript
   // Check queue is cleared:
   localStorage.getItem("pharmasys_sync_queue");
   // Expected: null or empty array []
   ```

4. **Refresh page**
   - Press F5
   - Both products should still be visible
   - Synced product now from database (not just cache)

### Expected Timeline

```
T=0s:  Switch to Online
T=1s:  "Syncing..."
T=2s:  Request sent to server
T=3s:  "Sync complete!"
T=4s:  Queue cleared
```

### Screenshot Checklist

- [ ] Sync status changed
- [ ] Completed notification shown
- [ ] Queue cleared
- [ ] Products persist after refresh

---

## 🔧 Test 4: Error Handling & Retry (5 min)

### Setup

**Intentionally break backend to test retry logic**

1. **Stop the backend**
   - Go to backend terminal
   - Press Ctrl+C

   ```
   ^C
   $
   ```

2. **Add offline product**

   ```
   // With backend DOWN and frontend Offline
   Name: Retry Test Product
   Price: $29.99
   ```

3. **Verify queued**
   ```
   ✅ Offline indicator shows
   ✅ "Pending: 1" appears
   ✅ Product in local list
   ```

### Steps

1. **Restart Backend**

   ```bash
   # In backend terminal
   npm run dev

   # Wait for:
   # 🚀 Server running on http://localhost:4000
   # 💉 PharmaSys Backend Started
   ```

2. **Go Online**
   - DevTools → Network → Throttling → "No throttling"

3. **Watch Sync with Retry**

   ```
   Expected behavior:
   ✅ "Syncing..." appears
   ✅ Request fails (backend was restarting)
   ✅ "Retrying..." shown (1/3)
   ✅ After ~2-4 seconds: Sync succeeds
   ✅ Queue cleared
   ✅ Product synced to database
   ```

4. **Verify No Data Loss**
   - Refresh page (products persist)
   - All 3 test products visible
   - Backend logs show successful POST

### Retry Logic Check

```javascript
// If retry fails, manually trigger:
window.dispatchEvent(new Event("online"));

// Or check retry count:
JSON.parse(localStorage.getItem("pharmasys_sync_queue"));
// If still there, retries exhausted
```

---

## 📋 Test Verification Checklist

### Test 1: Online ✅

- [ ] Product form submitted
- [ ] Product in list instantly
- [ ] No queue created
- [ ] Sync indicator: "Online"
- [ ] Backend logs: 201 Created

### Test 2: Offline ✅

- [ ] Product form submitted
- [ ] Product in list (localStorage)
- [ ] Queue populated
- [ ] Sync indicator: "Offline"
- [ ] localStorage has queue

### Test 3: Auto Sync ✅

- [ ] Sync status changed to "Syncing"
- [ ] Sync completed successfully
- [ ] Queue cleared
- [ ] Products persist after refresh
- [ ] Backend has all products

### Test 4: Retry Logic ✅

- [ ] Failed request queued
- [ ] Retry successful after backend restart
- [ ] No data loss
- [ ] Queue cleared
- [ ] Product synced to database

---

## 🔍 Console Debugging Commands

```javascript
// 1. Check all pending requests
localStorage.getItem("pharmasys_sync_queue");

// 2. Force offline (like DevTools)
window.dispatchEvent(new Event("offline"));

// 3. Force online (triggers sync)
window.dispatchEvent(new Event("online"));

// 4. Listen to sync events
window.addEventListener("syncStart", () => console.log("Sync started"));
window.addEventListener("syncSuccess", (e) => console.log("Success:", e));
window.addEventListener("syncFailed", (e) => console.log("Failed:", e));
window.addEventListener("syncComplete", () => console.log("Done!"));

// 5. Check user context (required headers)
localStorage.getItem("user_id");
localStorage.getItem("user_role");
localStorage.getItem("pharmacy_id");

// 6. Clear all data (nuclear option)
localStorage.clear();

// 7. Get API client status
const { getApiClient } = await import("./lib/apiClient.ts");
getApiClient();
```

---

## 🚨 Troubleshooting During Tests

### Problem: "Backend not responding"

```bash
# Check if backend is running
lsof -i :4000

# If not, restart:
cd backend && npm run dev

# If port in use:
pkill -f "npm run dev"  # Kill all dev servers
npm run dev             # Start fresh
```

### Problem: "Products don't appear in list"

```javascript
// Check in console:
localStorage.getItem("pharmasys_products"); // Cached data
JSON.parse(localStorage.pharmasys_sync_queue); // Pending
```

### Problem: "Offline indicator not showing"

```javascript
// Check connection detection
navigator.onLine; // Should be true (or false if offline)

// Check event listener
window.dispatchEvent(new Event("offline"));
// Component should update
```

### Problem: "Sync not triggering on reconnect"

```javascript
// Manually trigger
window.dispatchEvent(new Event("online"));

// Check event listeners
window.addEventListener("online", () => console.log("Online event fired"));
```

---

## ✳️ Test Results Log

**Date:** 2026-04-12  
**Tester:** [Your Name]  
**Device:** [Browser, OS]

| Test           | Status | Notes | Timestamp |
| -------------- | ------ | ----- | --------- |
| 1: Online Add  | ⭕     |       |           |
| 2: Offline Add | ⭕     |       |           |
| 3: Auto Sync   | ⭕     |       |           |
| 4: Retry Logic | ⭕     |       |           |

**Legend:** ⭕ = Not tested, 🟢 = Passed, 🔴 = Failed

---

## 📊 Expected Results Summary

### ✅ All Tests Pass When:

- Backend responds to health check
- Frontend loads without console errors
- Offline product stays in list on refresh
- Queue populated with correct data
- Sync triggers on online event
- Queue cleared after sync
- All products visible in database
- Retry logic works on network failure

### ❌ Debug if Any Fail:

1. Check browser console (F12 → Console tab)
2. Check backend logs
3. Check localStorage contents
4. Verify connection status
5. Try clearing cache and restarting

---

## 🎉 Success Indicators

When all tests pass, you'll see:

```
Frontend:
✅ Offline indicator responsive
✅ Sync badge showing correct count
✅ Products persist offline
✅ Auto-sync on reconnect

Backend:
✅ All requests logged
✅ Database updated correctly
✅ No server errors
✅ Health check responding

localhost:4000:
✅ All endpoints working
✅ Database connected
✅ CORS headers set

localhost:8080:
✅ React app running
✅ Hooks functional
✅ Storage working
✅ Events firing
```

---

**You're ready! Start testing now! 🚀**

Questions? Check console errors or backend logs for clues.
