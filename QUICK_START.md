# 🚀 دليل البدء السريع - Frontend Backend Integration

## ⚡ في 5 دقائق فقط

### 1️⃣ تأكد من Backend مشغل

```bash
cd backend
npm run dev
# يجب أن تشوف: "🚀 Server running on http://localhost:4000"
```

### 2️⃣ أضف المتغيرات البيئية

في `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 3️⃣ هيّئ Sync System في main.tsx

استبدل محتوى `frontend/src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SyncProvider } from "@/lib/SyncProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>,
);
```

### 4️⃣ أضف Sync Status Badge إلى Header

في `frontend/src/components/AppLayout.tsx` أو Layout الرئيسي:

```tsx
import { SyncStatusBadge } from "@/components/SyncStatus";

export function AppLayout() {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      <h1>PharmaSys</h1>
      <SyncStatusBadge /> {/* ← أضف هذا */}
    </header>
  );
}
```

### 5️⃣ ابدأ بـ Frontend

```bash
cd frontend
npm run dev
# سيشتغل على: http://localhost:5173
```

---

## 🎯 الاستخدام الأساسي

### جلب البيانات

```tsx
import { useApiData } from "@/hooks/useApi";

function MyPage() {
  const { data, loading, error } = useApiData("/products");

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### إضافة بيانات جديدة

```tsx
import { useMutation } from "@/hooks/useApi";

function AddItem() {
  const { mutate, loading } = useMutation("POST");

  const handleAdd = async () => {
    await mutate("/products", {
      name: "منتج جديد",
      sellPrice: 10,
    });
  };

  return (
    <button onClick={handleAdd} disabled={loading}>
      {loading ? "جاري الحفظ..." : "إضافة"}
    </button>
  );
}
```

### تحديث بيانات

```tsx
const { mutate: update } = useMutation("PUT");

await update("/products/123", {
  name: "اسم جديد",
});
```

### حذف بيانات

```tsx
const { mutate: remove } = useMutation("DELETE");

await remove("/products/123");
```

---

## 🌐 اختبار الـ Offline Mode

### طريقة سريعة:

1. افتح DevTools (F12)
2. Network tab
3. اضغط على "Throttling"
4. اختر "Offline"
5. جرّب إضافة بيانات
6. شوف "✅ تم الحفظ محليًا"
7. غيّر مرة أخرى "Online"
8. شوف المزامنة التلقائية! 🔄

---

## ✅ تأكد من كل شيء يعمل

```bash
# 1. Backend على http://localhost:4000
curl http://localhost:4000/api/health
# Response: {"status":"ok",...}

# 2. Frontend على http://localhost:5173
# Check browser network tab for successful requests

# 3. Open DevTools Console
navigator.onLine  # Should return true

# 4. Try offline
# DevTools > Network > set to Offline
# Try to add data
# Should see success message and data saved locally
```

---

## 📁 الملفات المهمة

- ✅ `/src/lib/apiClient.ts` - عميل API
- ✅ `/src/hooks/useApi.ts` - React hooks
- ✅ `/src/components/SyncStatus.tsx` - مؤشرات الحالة
- 📖 `/FRONTEND_INTEGRATION.md` - شرح كامل

---

## 🔧 استكشاف الأخطاء السريع

### "Cannot GET /api/products"

- Backend مقطوع؟ `npm run dev` في backend folder
- URL خاطئ؟ تأكد من `VITE_API_URL=http://localhost:4000/api`

### "CORS error"

- تأكد Backend يحتوي `app.use(cors())` ✅ موجود

### البيانات لا تحفظ محليًا

- تأكد localStorage مشغل (معظم المتصفحات تفعله)
- جرّب تفريغ البيانات: `localStorage.clear()`

### المزامنة لا تحدث عند الاتصال

- تأكد Backend مشغل
- قدّم refresh للصفحة
- افتح DevTools console وشوف الـ logs

---

## 🚀 Next Steps

الآن بتقدر:

- ⚡ جلب البيانات من Backend
- 💾 حفظ البيانات محليًا عند قطع الإنترنت
- 🔄 مزامنة تلقائية عند عودة الاتصال
- 📱 استخدام نفس الـ Code في Online و Offline

**دور بتاح؟ ابدأ بـ:/src/pages/ProductsPageExample.tsx**

---

## 💡 نصائح

1. **استخدم `useApiData` للقراءة** - يسحب الـ cache تلقائي
2. **استخدم `useMutation` للكتابة** - تحديث/إضافة/حذف
3. **اعرض `SyncStatusBadge`** - يوضح حالة الاتصال
4. **اختبر Offline دائمًا** - تأكد التطبيق يعمل بدون إنترنت

---

## ❓ أسئلة شائعة

**Q: كيف أتأكد Backend والـ Frontend متصلين؟**
A: افتح DevTools Network tab، ابدأ صفحة، شوف طلبات API

**Q: كيف أختبر الـ Offline mode؟**
A: DevTools > Network tab > Throttling > Offline

**Q: هل البيانات تُحفظ في SQLite أم localStorage؟**
A: localStorage أساسي، SQLite كنسخة احتياطية

**Q: كيف أحذف البيانات المحفوظة؟**
A: Console: `localStorage.clear()`

**Q: هل يمكن تخصيص رسائل المزامنة؟**
A: نعم، في `/src/lib/apiClient.ts` عدّل رسائل الإشعارات

---

## 📞 اتصل بالدعم

وجدت مشكلة؟

1. اقرأ `/FRONTEND_INTEGRATION.md`
2. تفقد `/src/lib/INTEGRATION_GUIDE.ts`
3. جرب الأمثلة في `/src/pages/ProductsPageExample.tsx`

**السعادة! 🎉**
