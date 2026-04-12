# ⚡ Quick Launch Commands

**Copy-paste ready commands for immediate testing**

---

## 🚀 Start Everything (One Command Per Terminal)

### Terminal 1 - Backend

```bash
cd backend && npm run dev
```

Expected output:

```
🚀 Server running on http://localhost:4000
📡 API available at http://localhost:4000/api
💉 PharmaSys Backend Started
```

### Terminal 2 - Frontend

```bash
cd frontend && npm run dev
```

Expected output:

```
VITE v5.4.19  ready in 275 ms
➜  Local:   http://localhost:8080/
```

---

## 🌐 Access Application

### In Browser:

```
http://localhost:8080
```

---

## ✅ Verify Everything Works

### 1. Backend Health Check

```bash
curl http://localhost:4000/api/health
```

Expected:

```json
{ "status": "ok", "timestamp": "..." }
```

### 2. Frontend Loads

- Open http://localhost:8080 in browser
- Page loads without errors
- Check console (F12) for no red errors

### 3. Sync Indicator Visible

- Should see connection status in top right
- Shows "🌐 Online" or similar

---

## 🧪 Quick Offline Test (2 minutes)

### Step 1: Go Offline

```javascript
// In browser console (F12 → Console)
window.dispatchEvent(new Event("offline"));
```

See indicator change to "🔴 Offline"

### Step 2: Add Data Offline

- Navigate to any page
- Try adding/editing data
- Should work locally

### Step 3: Trigger Sync

```javascript
// In browser console
window.dispatchEvent(new Event("online"));
```

Watch for "✅ Sync complete!"

---

## 📊 Check Queue

```javascript
// In browser console
JSON.parse(localStorage.getItem("pharmasys_sync_queue"));
```

If offline was working:

- Should see pending requests while offline
- Should be empty after sync completes

---

## 🐛 Quick Debugging

### See All Events

```javascript
// In browser console
window.addEventListener("syncSuccess", (e) =>
  console.log("✅ Synced:", e.detail),
);
window.addEventListener("syncFailed", (e) =>
  console.log("❌ Failed:", e.detail),
);
window.addEventListener("syncComplete", () => console.log("🎉 All synced!"));
```

### Check Connection

```javascript
navigator.onLine; // true or false
```

### Kill & Restart Backend

```bash
# Ctrl+C in backend terminal
npm run dev       # Restart
```

---

## 📋 Step-by-Step First Run

```bash
# Step 1: Terminal 1
cd backend && npm run dev

# Wait for "PharmaSys Backend Started"

# Step 2: Terminal 2 (new terminal)
cd pharmasys  # Go back to root
cd frontend && npm run dev

# Wait for "ready in X ms"

# Step 3: Open Browser
# Visit: http://localhost:8080

# Step 4: Check No Errors
# Press F12 and look for red errors

# Step 5: Test Online
# Try adding a product

# Step 6: Test Offline
# DevTools → Network → Throttling → "Offline"
# Try adding another product
# See "Offline" indicator

# Step 7: Test Sync
# Throttling → "No throttling"
# Watch indicator change to "Syncing..."
# Then "Sync complete!"

# Success! ✅
```

---

## 🎯 Checklist - Quick Pass

- [ ] Backend running: http://localhost:4000/api/health responds
- [ ] Frontend running: http://localhost:8080 loads
- [ ] No red console errors
- [ ] Sync indicator visible
- [ ] Can go offline (DevTools)
- [ ] Can trigger sync manually
- [ ] Queue shows pending requests
- [ ] Queue clears after sync

---

## 🎉 All Done!

```
✅ Backend: Running
✅ Frontend: Running
✅ Offline: Working
✅ Sync: Working
✅ Ready: YES!
```

**Next:** See MANUAL_TESTING_GUIDE.md for detailed tests

---

## 💾 Save This Command

```bash
# One-liner to check if everything is running:
echo "Backend:" && curl -s http://localhost:4000/api/health | grep status && \
echo "Frontend: Open http://localhost:8080"
```

---

**Questions?** Check the docs or run `npm run dev` and see the errors! 🚀
