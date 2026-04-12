# Frontend-Backend Integration Guide

## 🔄 نظام المزامنة الذكي Online/Offline

تم إنشاء نظام متقدم لربط الـ Frontend بالـ Backend مع دعم كامل للعمل بدون إنترنت.

### ✨ الميزات

- ✅ **عمل بدون إنترنت** - حفظ البيانات محليًا عند قطع الاتصال
- ✅ **مزامنة تلقائية** - إرسال البيانات برسالة واحدة عند عودة الاتصال
- ✅ **إعادة محاولة ذكية** - 3 محاولات تلقائية مع تأخير تدريجي
- ✅ **واجهة مستخدم واضحة** - مؤشرات حالة الاتصال والمزامنة
- ✅ **دعم الدفعات** - إرسال عدة طلبات في دفعة واحدة
- ✅ **تخزين آمن** - حفظ البيانات في localStorage + SQLite

---

## 📁 الملفات المُنشأة

### مكتبات (Lib)

- **`apiClient.ts`** - عميل API الرئيسي مع نظام المزامنة
- **`SyncProvider.tsx`** - Provider لتهيئة النظام
- **`INTEGRATION_GUIDE.ts`** - أمثلة التكامل

### Hooks

- **`useApi.ts`** - Hooks أساسية للطلبات
  - `useApi()` - الطلبات العامة
  - `useApiData()` - جلب البيانات
  - `useMutation()` - إنشاء/تحديث/حذف

- **`useCustomersApi.ts`** - مثال API hook للعملاء
- **`useSyncStatus.ts`** - مراقبة حالة المزامنة

### المكونات (Components)

- **`SyncStatus.tsx`** - عرض حالة الاتصال والمزامنة
  - `SyncStatusIndicator` - موشر عائم
  - `SyncStatusDot` - نقطة صغيرة
  - `SyncStatusBadge` - شارة في الـ Navbar

### أمثلة

- **`ProductsPageExample.tsx`** - مثال عملي كامل لصفحة منتجات

---

## 🚀 البدء السريع

### 1. تثبيت المتغيرات البيئية

إضف إلى `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:4000/api

# أو في الإنتاج:
VITE_API_URL=https://api.pharmasys.com/api
```

### 2. تهيئة في main.tsx

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { SyncProvider } from "@/lib/SyncProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>,
);
```

### 3. إضافة مؤشرات الحالة إلى Layout

```tsx
import { SyncStatusBadge } from "@/components/SyncStatus";

export function AppLayout() {
  return (
    <header className="flex justify-between items-center">
      <h1>التطبيق</h1>
      <SyncStatusBadge /> {/* Shows connection status */}
    </header>
  );
}
```

### 4. استخدام في الصفحات

```tsx
import { useApiData, useMutation } from '@/hooks/useApi'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

function ProductsPage() {
  const isOnline = useOnlineStatus()

  // جلب البيانات
  const { data: products, loading, error, refetch } = useApiData('/products')

  // إنشاء
  const { mutate: create, loading: isCreating } = useMutation('POST')

  // تحديث
  const { mutate: update, loading: isUpdating } = useMutation('PUT')

  // حذف
  const { mutate: remove, loading: isDeleting } = useMutation('DELETE')

  return (
    // UI here
  )
}
```

---

## 📖 أمثلة الاستخدام

### مثال 1: جلب البيانات

```tsx
import { useApiData } from "@/hooks/useApi";

function CustomersList() {
  const {
    data: customers,
    loading,
    error,
    refetch,
  } = useApiData("/customers", {
    autoFetch: true,
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      {customers?.map((customer) => (
        <div key={customer.id}>{customer.name}</div>
      ))}
      <button onClick={refetch}>تحديث</button>
    </div>
  );
}
```

### مثال 2: إنشاء عنصر جديد

```tsx
import { useMutation } from "@/hooks/useApi";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function AddCustomer() {
  const isOnline = useOnlineStatus();
  const { mutate, loading } = useMutation("POST");

  async function handleSubmit(formData) {
    const response = await mutate("/customers", formData, {
      onSuccess: () => {
        console.log("✅ تم حفظ الزبون");
      },
      onError: (error) => {
        console.log("❌ خطأ:", error);
      },
    });

    if (!response.success && response.error === "offline_saved") {
      // Data saved locally, will sync when online
      showToast("✅ تم الحفظ محليًا - سيتم المزامنة عند الاتصال");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(Object.fromEntries(new FormData(e.currentTarget)));
      }}
    >
      <input name="name" required />
      <button disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ"}</button>
      {!isOnline && <div>⚠️ أنت في وضع Offline</div>}
    </form>
  );
}
```

### مثال 3: تحديث عنصر

```tsx
import { useMutation } from "@/hooks/useApi";

function EditCustomer({ customerId }) {
  const { mutate: update, loading } = useMutation("PUT");

  async function handleUpdate(formData) {
    const response = await update(`/customers/${customerId}`, formData);
    if (response.success) {
      showToast("تم التحديث بنجاح");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleUpdate(Object.fromEntries(new FormData(e.currentTarget)));
      }}
    >
      <input name="name" required />
      <button disabled={loading}>
        {loading ? "جاري التحديث..." : "تحديث"}
      </button>
    </form>
  );
}
```

### مثال 4: حذف عنصر

```tsx
import { useMutation } from "@/hooks/useApi";

function DeleteCustomer({ customerId, onDeleted }) {
  const { mutate: remove, loading } = useMutation("DELETE");

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد؟")) {
      const response = await remove(`/customers/${customerId}`);
      if (response.success) {
        onDeleted();
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? "جاري الحذف..." : "حذف"}
    </button>
  );
}
```

### مثال 5: مراقبة حالة المزامنة

```tsx
import { useSyncStatus } from "@/hooks/useSyncStatus";

function SyncIndicator() {
  const { isPending, pendingCount, isSyncing, retry, clear } = useSyncStatus();

  if (isPending) {
    return (
      <div className="bg-amber-100 p-3 rounded">
        <p>{pendingCount} عنصر في الانتظار</p>
        {isSyncing && <p>جاري المزامنة...</p>}
        <button onClick={retry}>مزامنة الآن</button>
        <button onClick={clear}>مسح</button>
      </div>
    );
  }

  return null;
}
```

---

## 🔄 كيفية عمل الـ Sync

### السيناريو 1: متصل بالإنترنت ✅

```
المستخدم يملأ نموذج
       ↓
يضغط حفظ
       ↓
الطلب يُرسل فورًا للسيرفر
       ↓
السيرفر يعالج الطلب
       ↓
يأتي الرد
       ↓
البيانات تُعرض مباشرة
       ↓
تُحفظ أيضًا محليًا كنسخة احتياطية
```

### السيناريو 2: بدون إنترنت 📵

```
المستخدم يملأ نموذج
       ↓
يضغط حفظ
       ↓
تطبيق يكتشف عدم وجود إنترنت
       ↓
الطلب يُحفظ محليًا في قائمة الانتظار
       ↓
يظهر للمستخدم: "تم الحفظ محليًا"
       ↓
البيانات تُحفظ أيضًا في SQLite
       ↓
المستخدم يرى البيانات الجديدة فورًا (من SQLite)
```

### السيناريو 3: عودة الاتصال 🔄

```
المستخدم يضغط على أيقونة الاتصال
       ↓
التطبيق يكتشف عودة الإنترنت
       ↓
يبدأ المزامنة التلقائية
       ↓
يُرسل جميع الطلبات المعلقة دفعة واحدة
       ↓
السيرفر يعالجها
       ↓
التطبيق يحصل على النتائج
       ↓
يحدث البيانات التي تُعرض
       ↓
يظهر: "✅ تم المزامنة بنجاح"
       ↓
يحذف الطلبات من قائمة الانتظار
```

---

## 🛠️ التكوين المتقدم

```tsx
import { initApiClient } from "@/lib/apiClient";

initApiClient({
  baseUrl: "http://localhost:4000/api", // Backend URL
  timeout: 10000, // Request timeout (ms)
  maxRetries: 3, // Max retry attempts
  retryDelay: 1000, // Delay between retries (ms)
  batchSize: 10, // Batch size for sync
});
```

### المعاملات

| المعامل      | النوع  | القيمة الافتراضية           | الوصف                    |
| ------------ | ------ | --------------------------- | ------------------------ |
| `baseUrl`    | string | `http://localhost:4000/api` | رابط السيرفر             |
| `timeout`    | number | `10000`                     | انتظار الطلب (ملي ثانية) |
| `maxRetries` | number | `3`                         | عدد محاولات إعادة محاولة |
| `retryDelay` | number | `1000`                      | التأخير بين المحاولات    |
| `batchSize`  | number | `10`                        | عدد الطلبات في الدفعة    |

---

## 🔐 المصادقة

البيانات المصادقة تُحفظ في localStorage:

```tsx
// عند تسجيل الدخول
function handleLogin(user) {
  localStorage.setItem("user_id", user.id);
  localStorage.setItem("user_role", user.role);
  localStorage.setItem("pharmacy_id", user.pharmacyId);

  // تحديث API headers تلقائيًا
}

// عند تسجيل الخروج
function handleLogout() {
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");
  localStorage.removeItem("pharmacy_id");

  // إعادة توجيه للصفحة الرئيسية
}
```

---

## 📱 اختبار الـ Offline

### طريقة 1: مع DevTools

1. افتح DevTools (F12)
2. افتح Network tab
3. اضغط على Throttling dropdown
4. اختر "Offline"
5. حاول إضافة بيانات
6. شوف "تم الحفظ محليًا"
7. غيّر الـ Throttling ل "Online"
8. شوف البيانات تتزامن تلقائيًا

### طريقة 2: بدون DevTools

```typescript
// في console:
navigator.onLine; // Should return false
```

---

## 🐛 استكشاف الأخطاء

### الطلبات لا تُرسل

```tsx
// تأكد من:
1. API URL صحيح في .env
2. Backend مشغل (npm run dev من backend folder)
3. Headers صحيحة (x-user-id, x-user-role, x-pharmacy-id)
4. CORS enabled على Backend ✅ (موجود)
```

### البيانات لا تتزامن

```tsx
// تأكد من:
1. الاتصال بالإنترنت متوفر
2. localStorage ليس ممتلئ
3. لا توجد errors في console
4. البيانات موجودة في localStorage:
   // في console:
   localStorage.getItem('sync_queue')
```

### أخطاء CORS

```tsx
// تأكد من Backend يحتوي على:
app.use(cors()); // ✅ موجود في backend/src/index.ts
```

---

## 📞 الدعم والمساعدة

### الملفات الرئيسية

| الملف                            | الوصف            |
| -------------------------------- | ---------------- |
| `/src/lib/apiClient.ts`          | عميل API الرئيسي |
| `/src/lib/SyncProvider.tsx`      | تهيئة النظام     |
| `/src/hooks/useApi.ts`           | Hooks للطلبات    |
| `/src/hooks/useSyncStatus.ts`    | مراقبة المزامنة  |
| `/src/components/SyncStatus.tsx` | مكونات الحالة    |

### الأمثلة

| الملف                                | الوصف         |
| ------------------------------------ | ------------- |
| `/src/pages/ProductsPageExample.tsx` | مثال كامل     |
| `/src/lib/INTEGRATION_GUIDE.ts`      | شرح التكامل   |
| `/src/hooks/useCustomersApi.ts`      | مثال API Hook |

---

## ✅ قائمة التحقق

- [ ] Backend مشغل على `http://localhost:4000`
- [ ] `.env` يحتوي على `VITE_API_URL`
- [ ] `SyncProvider` موجود في `main.tsx`
- [ ] `SyncStatusBadge` موجود في Layout
- [ ] جرّب Offline mode من DevTools
- [ ] تأكد من المزامنة التلقائية تعمل
- [ ] اختبر جميع العمليات (Create, Read, Update, Delete)

---

## 🎉 تم الإعداد!

النظام جاهز للاستخدام الكامل مع:

- ✅ عمل بدون إنترنت
- ✅ مزامنة تلقائية
- ✅ واجهة واضحة
- ✅ معالجة أخطاء شاملة
- ✅ حفظ آمن للبيانات

**الآن يمكنك استخدام الـ API hooks في جميع صفحاتك!**
