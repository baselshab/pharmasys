# 🚀 PharmaSys - 5 Minute Start Guide

## ⚡ Quick Setup

### Windows:

```bash
setup.bat
```

### Mac/Linux:

```bash
chmod +x setup.sh
./setup.sh
```

---

## 🔧 Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Listens on http://localhost:4000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Opens http://localhost:5173
```

---

## ✅ Verify Setup

- [ ] Backend running: `curl http://localhost:4000/api/health`
- [ ] Frontend loading: Open `http://localhost:5173`
- [ ] No red errors in console
- [ ] Sync status indicator visible in UI

---

## 🧪 Test Offline/Online Sync (1 minute)

1. **Open DevTools**: Press `F12`
2. **Go to Network tab**
3. **Throttling dropdown** → Select **"Offline"**
4. **Add data** in the app (should work!)
5. **Notice**: "Offline" indicator appears
6. **Back to Network tab** → Set to **"No throttling"**
7. **Watch**: Data syncs automatically! 🔄

---

## 📝 Create First API Hook

Create `frontend/src/hooks/useProductsApi.ts`:

```typescript
import { useApi } from "./useApi";

export function useProductsApi() {
  const { request } = useApi();

  return {
    list: () => request("GET", "/products"),
    create: (data) => request("POST", "/products", data),
    update: (id, data) => request("PUT", `/products/${id}`, data),
    delete: (id) => request("DELETE", `/products/${id}`),
  };
}
```

---

## 🎨 Use in Component

```typescript
import { useApiData, useMutation } from '@/hooks/useApi'
import { SyncStatusBadge } from '@/components/SyncStatus'

export function ProductPage() {
  const { data: products, loading } = useApiData('/products')
  const { mutate: save } = useMutation('POST')

  if (loading) return <div>Loading...</div>

  return (
    <>
      <SyncStatusBadge />
      <button onClick={() => save('/products', { name: 'Test' })}>
        Add Product
      </button>
      {products?.map(p => <div key={p.id}>{p.name}</div>)}
    </>
  )
}
```

---

## 🔐 Auth Headers (Required)

All API requests need these headers (automatically added):

```
x-user-id: user-123
x-user-role: cashier
x-pharmacy-id: 1
```

Set on login:

```typescript
localStorage.setItem("user_id", userId);
localStorage.setItem("user_role", userRole);
localStorage.setItem("pharmacy_id", pharmacyId);
```

---

## 📚 Documentation

| File                                               | What                 | Time   |
| -------------------------------------------------- | -------------------- | ------ |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Complete walkthrough | 20 min |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Deep dive            | 30 min |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)         | Architecture         | 15 min |

---

## 🚨 Common Issues

### ❌ "Cannot connect to backend"

- Check backend running on `http://localhost:4000/api/health`
- Check `VITE_API_URL` in `frontend/.env`

### ❌ "Offline not working"

- DevTools > Network > Throttling must be "Offline"
- Try pressing F12 and looking at Network tab

### ❌ "Data not syncing"

- Manually trigger: `window.dispatchEvent(new Event('online'))`
- Check console for errors
- Clear localStorage: `localStorage.clear()`

---

## 💡 Key Features Ready to Use

✅ **Offline-First**: Works without internet  
✅ **Auto Sync**: Queues requests offline, syncs on reconnect  
✅ **React Hooks**: useApi, useApiData, useMutation  
✅ **UI Components**: SyncStatusBadge, SyncStatusDot, SyncStatusIndicator  
✅ **50+ APIs**: Products, Sales, Customers, Users, Reports, etc.  
✅ **Error Handling**: Automatic retry, batch processing  
✅ **PWA Ready**: Works as web app

---

## 🎯 Next Steps

1. Test offline mode (5 min above)
2. Create API hook for your resource
3. Update one page component
4. Test full workflow
5. Deploy when ready

---

## 📞 Need Help?

1. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Step by step
2. Check [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Advanced topics
3. Check browser console - Error messages
4. Check backend logs - Server errors

---

**Let's build! 🚀**

```bash
# Final check
cd backend && npm run dev &
cd frontend && npm run dev
# Visit http://localhost:5173
```

**Everything works? You're done! 🎉**
