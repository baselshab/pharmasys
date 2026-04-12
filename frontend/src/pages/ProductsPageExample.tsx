/**
 * Example: Products Page with API Integration
 * 
 * This shows a complete example of using the new API client
 * with automatic offline/online sync support
 */

import { useState } from "react";
import { useApiData, useMutation } from "@/hooks/useApi";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncStatus } from "@/hooks/useSyncStatus";

interface Product {
  id: string;
  name: string;
  genericName?: string;
  barcode?: string;
  unit: string;
  sellPrice: number;
  costPrice: number;
  reorderLevel: number;
  isActive: boolean;
  category?: { id: string; name: string };
}

export function ProductsPageExample() {
  const isOnline = useOnlineStatus();
  const { isPending, pendingCount } = useSyncStatus();

  // Fetch products from API
  const { data: products, loading, error, refetch } = useApiData<Product[]>(
    "/products",
    {
      autoFetch: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Create new product
  const createMutation = useMutation<Product>("POST");
  const [showForm, setShowForm] = useState(false);

  const handleCreateProduct = async (formData: any) => {
    const response = await createMutation.mutate("/products", formData, {
      onSuccess: () => {
        setShowForm(false);
        refetch();
      },
    });

    if (!response.success) {
      if (response.error === "offline_saved") {
        console.log("✅ تم حفظ المنتج محليًا وسيتم إضافته للسيرفر عند الاتصال");
      } else {
        console.error("❌ خطأ:", response.error);
      }
    }
  };

  // Delete product
  const deleteMutation = useMutation<void>("DELETE");

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const response = await deleteMutation.mutate(`/products/${productId}`, undefined, {
        onSuccess: () => refetch(),
      });

      if (!response.success && response.error === "offline_saved") {
        console.log("✅ تم حذف المنتج محليًا وسيتم حذفه من السيرفر عند الاتصال");
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header with Status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">المنتجات</h1>

        <div className="flex gap-4 items-center">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm">
              {isOnline ? "متصل بالإنترنت" : "بدون إنترنت"}
            </span>
          </div>

          {/* Pending Sync Count */}
          {isPending && (
            <div className="text-sm bg-amber-100 px-3 py-1 rounded-full">
              {pendingCount} عنصر في الانتظار
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={refetch}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition"
          >
            {loading ? "جاري التحديث..." : "تحديث"}
          </button>

          {/* Add Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
          >
            {showForm ? "إلغاء" : "إضافة منتج"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <ProductForm
          onSubmit={handleCreateProduct}
          isLoading={createMutation.loading}
          isOnline={isOnline}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          خطأ: {error}
          <button
            onClick={refetch}
            className="ml-4 underline hover:no-underline font-bold"
          >
            إعادة محاولة
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">جاري تحميل المنتجات...</div>
        </div>
      )}

      {/* Products List */}
      {!loading && products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={() => handleDeleteProduct(product.id)}
              isDeletingOnline={deleteMutation.loading}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center text-gray-500 py-12">
            لا توجد منتجات
          </div>
        )
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  onDelete,
  isDeletingOnline,
}: {
  product: Product;
  onDelete: () => void;
  isDeletingOnline: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      <h3 className="font-bold text-lg mb-2">{product.name}</h3>

      {product.genericName && (
        <p className="text-sm text-gray-600 mb-2">{product.genericName}</p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <span className="text-gray-600">السعر:</span>
          <p className="font-semibold">{product.sellPrice} ر.س</p>
        </div>
        <div>
          <span className="text-gray-600">التكلفة:</span>
          <p className="font-semibold">{product.costPrice} ر.س</p>
        </div>
      </div>

      {product.category && (
        <p className="text-xs text-gray-500 mb-4">
          الفئة: {product.category.name}
        </p>
      )}

      <div className="flex gap-2">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded text-sm transition">
          تعديل
        </button>
        <button
          onClick={onDelete}
          disabled={isDeletingOnline}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-1 rounded text-sm transition"
        >
          {isDeletingOnline ? "جاري الحذف..." : "حذف"}
        </button>
      </div>
    </div>
  );
}

// Product Form Component
function ProductForm({
  onSubmit,
  isLoading,
  isOnline,
}: {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  isOnline: boolean;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    onSubmit(data);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              اسم المنتج *
            </label>
            <input
              type="text"
              name="name"
              required
              disabled={isLoading}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-200"
              placeholder="مثال: باراسيتامول 500 ملغ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              الاسم العلمي
            </label>
            <input
              type="text"
              name="genericName"
              disabled={isLoading}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              سعر البيع *
            </label>
            <input
              type="number"
              name="sellPrice"
              step="0.01"
              required
              disabled={isLoading}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              سعر التكلفة
            </label>
            <input
              type="number"
              name="costPrice"
              step="0.01"
              disabled={isLoading}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-200"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          {isOnline
            ? "✅ متصل - سيتم الحفظ فورًا على السيرفر"
            : "📵 بدون إنترنت - سيتم الحفظ محليًا والمزامنة عند الاتصال"}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded font-medium transition"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </div>
  );
}
