import { useState, useEffect, useCallback } from "react";
import { getApiClient, ApiResponse } from "@/lib/apiClient";
import { useOnlineStatus } from "./useOnlineStatus";

export interface UseApiOptions {
  autoFetch?: boolean;
  cacheTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi() {
  const apiClient = getApiClient();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T = any>(
      method: "GET" | "POST" | "PUT" | "DELETE",
      url: string,
      body?: any,
      options?: UseApiOptions
    ): Promise<ApiResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        let response: ApiResponse<T>;

        switch (method) {
          case "GET":
            response = await apiClient.get<T>(url);
            break;
          case "POST":
            response = await apiClient.post<T>(url, body);
            break;
          case "PUT":
            response = await apiClient.put<T>(url, body);
            break;
          case "DELETE":
            response = await apiClient.delete<T>(url);
            break;
        }

        if (response.success) {
          options?.onSuccess?.(response.data);
        } else if (response.error && response.error !== "offline_saved") {
          setError(response.error);
          options?.onError?.(response.error);
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  return {
    request,
    loading,
    error,
    isOnline,
    get: (url: string, options?: UseApiOptions) => request("GET", url, undefined, options),
    post: (url: string, body: any, options?: UseApiOptions) =>
      request("POST", url, body, options),
    put: (url: string, body: any, options?: UseApiOptions) => request("PUT", url, body, options),
    delete: (url: string, options?: UseApiOptions) => request("DELETE", url, undefined, options),
  };
}

export function useApiData<T = any>(
  url: string,
  options?: UseApiOptions
) {
  const { get } = useApi();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const response = await get(url, {
      ...options,
      onSuccess: (data) => {
        setData(data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        setError(error);
        options?.onError?.(error);
      },
    });

    if (response.success) {
      setData(response.data as T);
    } else {
      setError(response.error || "Failed to fetch data");
    }

    setLoading(false);
  }, [url, get, options]);

  useEffect(() => {
    if (options?.autoFetch !== false) {
      refetch();
    }
  }, [url, refetch, options?.autoFetch]);

  return { data, loading, error, refetch };
}

export function useMutation<T = any>(
  method: "POST" | "PUT" | "DELETE" = "POST"
) {
  const { request } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (url: string, body?: any, options?: UseApiOptions) => {
      setLoading(true);
      setError(null);

      const response = await request<T>(method, url, body, options);

      if (response.success) {
        setData(response.data as T);
      } else {
        setError(response.error || "Mutation failed");
      }

      setLoading(false);
      return response;
    },
    [method, request]
  );

  return { mutate, loading, error, data };
}

// Specific mutation hooks
export function useCreateMutation<T = any>(options?: UseApiOptions) {
  return useMutation<T>("POST");
}

export function useUpdateMutation<T = any>(options?: UseApiOptions) {
  return useMutation<T>("PUT");
}

export function useDeleteMutation<T = any>(options?: UseApiOptions) {
  return useMutation<T>("DELETE");
}
