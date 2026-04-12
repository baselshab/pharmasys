import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncStatus, useSyncNotifications } from "@/hooks/useSyncStatus";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Wifi, WifiOff, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncStatusIndicator() {
  const isOnline = useOnlineStatus();
  const { isPending, pendingCount, isSyncing, retry, clear } = useSyncStatus();
  const notification = useSyncNotifications();
  const [showDetails, setShowDetails] = useState(false);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && isPending) {
      retry();
    }
  }, [isOnline, isPending, retry]);

  if (!isPending && isOnline) {
    return null; // Don't show anything when all is good
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Notification Toast */}
      {notification?.shown && (
        <div
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 p-3 rounded-lg text-sm shadow-lg text-white",
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          )}
        >
          {notification.message}
        </div>
      )}

      {/* Main Status Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-green-700">متصل بالإنترنت</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-red-700">بدون إنترنت</span>
            </>
          )}
        </div>

        {/* Pending Items */}
        {isPending && (
          <div className="bg-amber-50 rounded p-2 mb-2 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-xs font-medium text-amber-700">
                {isSyncing ? "جاري المزامنة..." : `${pendingCount} عنصر في الانتظار`}
              </span>
            </div>

            {isSyncing && (
              <div className="text-xs text-amber-600 ml-6">
                جاري تحديث البيانات على السيرفر...
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {isPending && !isOnline && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 rounded transition"
            >
              {showDetails ? "إخفاء" : "التفاصيل"}
            </button>
          )}

          {isPending && isOnline && (
            <button
              onClick={retry}
              disabled={isSyncing}
              className="flex-1 text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-1 rounded transition flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              مزامنة
            </button>
          )}

          {isPending && (
            <button
              onClick={clear}
              className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white py-1 rounded transition flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              مسح
            </button>
          )}
        </div>

        {/* Expanded Details */}
        {showDetails && isPending && (
          <div className="mt-3 pt-3 border-t border-gray-200 max-h-48 overflow-y-auto">
            <div className="text-xs text-gray-600 font-semibold mb-2">العناصر المعلقة:</div>
            <div className="space-y-1">
              {/* Request list would go here */}
              <div className="text-xs text-gray-500">
                {pendingCount} طلب في انتظار المزامنة
              </div>
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isOnline && isPending ? (
            <div className="flex items-center justify-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              المزامنة قريبًا...
            </div>
          ) : isOnline ? (
            <div className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              كل شيء متزامن
            </div>
          ) : (
            <div>عدد العناصر: {pendingCount}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact indicator (just a dot)
export function SyncStatusDot() {
  const isOnline = useOnlineStatus();
  const { isPending } = useSyncStatus();

  if (isOnline && !isPending) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-3 h-3 rounded-full animate-pulse",
        isOnline ? "bg-amber-500" : "bg-red-500"
      )}
      title={isOnline ? "جاري المزامنة" : "بدون إنترنت"}
    />
  );
}

// Badge for navbar
export function SyncStatusBadge() {
  const isOnline = useOnlineStatus();
  const { isPending, pendingCount } = useSyncStatus();

  if (!isPending && isOnline) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        متصل
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        بدون إنترنت ({pendingCount})
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
      <RefreshCw className="w-3 h-3 animate-spin" />
      مزامنة ({pendingCount})
    </div>
  );
}
