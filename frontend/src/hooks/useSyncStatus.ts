import { useState, useEffect, useCallback } from "react";
import { getApiClient, PendingRequest } from "@/lib/apiClient";

export interface SyncStatus {
  isPending: boolean;
  pendingCount: number;
  queuedRequests: PendingRequest[];
  lastSyncTime?: number;
  isSyncing: boolean;
}

export function useSyncStatus() {
  const apiClient = getApiClient();
  const [status, setStatus] = useState<SyncStatus>({
    isPending: false,
    pendingCount: 0,
    queuedRequests: [],
    isSyncing: false,
  });

  const updateStatus = useCallback(() => {
    const queue = apiClient.getPendingQueue();
    setStatus({
      isPending: queue.length > 0,
      pendingCount: queue.length,
      queuedRequests: queue,
      isSyncing: false,
    });
  }, [apiClient]);

  useEffect(() => {
    updateStatus();

    // Listen to sync events
    const handleSyncQueueUpdated = () => updateStatus();
    const handleSyncSuccess = () => {
      setStatus((prev) => ({
        ...prev,
        lastSyncTime: Date.now(),
      }));
      updateStatus();
    };
    const handleSyncComplete = () => {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
      }));
      updateStatus();
    };

    window.addEventListener("syncQueueUpdated", handleSyncQueueUpdated);
    window.addEventListener("syncSuccess", handleSyncSuccess);
    window.addEventListener("syncComplete", handleSyncComplete);

    return () => {
      window.removeEventListener("syncQueueUpdated", handleSyncQueueUpdated);
      window.removeEventListener("syncSuccess", handleSyncSuccess);
      window.removeEventListener("syncComplete", handleSyncComplete);
    };
  }, [updateStatus]);

  const retry = useCallback(() => {
    apiClient.syncPendingRequests();
    setStatus((prev) => ({ ...prev, isSyncing: true }));
  }, [apiClient]);

  const clear = useCallback(() => {
    apiClient.clearQueue();
    updateStatus();
  }, [apiClient, updateStatus]);

  return {
    ...status,
    retry,
    clear,
    hasFailedRequests: status.queuedRequests.some(
      (req) => req.retries >= 3
    ),
  };
}

export function useSyncNotifications() {
  const [notification, setNotification] = useState<{
    type: "info" | "warning" | "error" | "success";
    message: string;
    shown: boolean;
  } | null>(null);

  useEffect(() => {
    const handleSyncSuccess = (event: CustomEvent) => {
      const { request } = event.detail;
      setNotification({
        type: "success",
        message: `✅ تم ${request.method === "POST" ? "إضافة" : request.method === "DELETE" ? "حذف" : "تحديث"} البيانات بنجاح`,
        shown: true,
      });
      setTimeout(() => setNotification(null), 3000);
    };

    const handleSyncFailed = (event: CustomEvent) => {
      const { request, error } = event.detail;
      setNotification({
        type: "error",
        message: `❌ فشل ${request.method === "POST" ? "إضافة" : request.method === "DELETE" ? "حذف" : "تحديث"} البيانات: ${error}`,
        shown: true,
      });
    };

    window.addEventListener("syncSuccess", handleSyncSuccess as EventListener);
    window.addEventListener("syncFailed", handleSyncFailed as EventListener);

    return () => {
      window.removeEventListener("syncSuccess", handleSyncSuccess as EventListener);
      window.removeEventListener("syncFailed", handleSyncFailed as EventListener);
    };
  }, []);

  return notification;
}
