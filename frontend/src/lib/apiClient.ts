// API Client for Online/Offline Support
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface PendingRequest {
  id: string;
  method: string;
  url: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

export interface SyncConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  baseUrl: string;
  timeout: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 10,
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
};

class ApiClient {
  private config: SyncConfig;
  private isOnline: boolean = navigator.onLine;
  private pendingQueue: PendingRequest[] = [];
  private syncInProgress: boolean = false;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadPendingQueue();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  private handleOnline() {
    this.isOnline = true;
    console.log("📡 Connection restored - starting sync...");
    this.syncPendingRequests();
  }

  private handleOffline() {
    this.isOnline = false;
    console.log("📵 Connection lost - working offline");
  }

  private loadPendingQueue() {
    try {
      const stored = localStorage.getItem("sync_queue");
      if (stored) {
        this.pendingQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load pending queue:", error);
      this.pendingQueue = [];
    }
  }

  private savePendingQueue() {
    try {
      localStorage.setItem("sync_queue", JSON.stringify(this.pendingQueue));
    } catch (error) {
      console.error("Failed to save pending queue:", error);
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    body?: any,
    options: { isRetry?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith("http") ? url : `${this.config.baseUrl}${url}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-user-id": localStorage.getItem("user_id") || "user-default",
      "x-user-role": localStorage.getItem("user_role") || "cashier",
      "x-pharmacy-id": localStorage.getItem("pharmacy_id") || "ph-001",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Request failed: ${method} ${url}`, errorMessage);

      // Only add to queue if it's not a GET request and we're offline
      if (!this.isOnline && method !== "GET" && !options.isRetry) {
        this.addToQueue(method, url, body);
        notification?.error("رسالة حفظت محليًا - ستُرسل عند الاتصال", "تم الحفظ وسيتم المزامنة");
        return { success: false, error: "saved_offline" };
      }

      return { success: false, error: errorMessage };
    }
  }

  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("GET", url);
  }

  async post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    if (this.isOnline) {
      return this.makeRequest<T>("POST", url, body);
    } else {
      this.addToQueue("POST", url, body);
      notification?.info("تم الحفظ محليًا في انتظار الاتصال", "وضع Offline");
      return { success: false, error: "offline_saved" };
    }
  }

  async put<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    if (this.isOnline) {
      return this.makeRequest<T>("PUT", url, body);
    } else {
      this.addToQueue("PUT", url, body);
      notification?.info("تم التحديث محليًا في انتظار الاتصال", "وضع Offline");
      return { success: false, error: "offline_saved" };
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    if (this.isOnline) {
      return this.makeRequest<T>("DELETE", url);
    } else {
      this.addToQueue("DELETE", url);
      notification?.info("تم الحذف محليًا في انتظار الاتصال", "وضع Offline");
      return { success: false, error: "offline_saved" };
    }
  }

  private addToQueue(method: string, url: string, body?: any) {
    const request: PendingRequest = {
      id: this.generateRequestId(),
      method,
      url,
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    this.pendingQueue.push(request);
    this.savePendingQueue();

    // Dispatch event for listeners
    window.dispatchEvent(
      new CustomEvent("syncQueueUpdated", { detail: { queue: this.pendingQueue } })
    );
  }

  async syncPendingRequests() {
    if (this.syncInProgress || !this.isOnline || this.pendingQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const toSync = [...this.pendingQueue].slice(0, this.config.batchSize);

    for (const request of toSync) {
      try {
        const response = await this.makeRequest(
          request.method,
          request.url,
          request.body,
          { isRetry: true }
        );

        if (response.success || response.error !== "offline_saved") {
          // Remove from queue on success or non-recoverable error
          this.pendingQueue = this.pendingQueue.filter((r) => r.id !== request.id);
          this.savePendingQueue();

          window.dispatchEvent(
            new CustomEvent("syncSuccess", { detail: { request } })
          );
        } else {
          // Increment retry count
          const index = this.pendingQueue.findIndex((r) => r.id === request.id);
          if (index !== -1) {
            this.pendingQueue[index].retries += 1;
          }

          if (this.pendingQueue[index] && this.pendingQueue[index].retries >= this.config.maxRetries) {
            this.pendingQueue = this.pendingQueue.filter((r) => r.id !== request.id);
            window.dispatchEvent(
              new CustomEvent("syncFailed", { detail: { request, error: "Max retries reached" } })
            );
          }
        }
      } catch (error) {
        console.error("Sync error:", error);
      }

      // Add delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.savePendingQueue();
    this.syncInProgress = false;

    // Dispatch final sync complete event
    window.dispatchEvent(
      new CustomEvent("syncComplete", { detail: { queue: this.pendingQueue } })
    );
  }

  getPendingQueue(): PendingRequest[] {
    return this.pendingQueue;
  }

  getPendingCount(): number {
    return this.pendingQueue.length;
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  // For testing/clearing
  clearQueue() {
    this.pendingQueue = [];
    this.savePendingQueue();
  }
}

// Global singleton instance
let apiClientInstance: ApiClient | null = null;

export function initApiClient(config?: Partial<SyncConfig>): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
}

// Mock notification for now - replace with actual notification system
const notification = {
  error: (title: string, message: string) => console.error(title, message),
  info: (title: string, message: string) => console.info(title, message),
  success: (title: string, message: string) => console.log(title, message),
};

export default ApiClient;
