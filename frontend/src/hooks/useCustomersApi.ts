import { useState, useCallback } from "react";
import { useApi, useApiData, useMutation } from "./useApi";
import { useOnlineStatus } from "./useOnlineStatus";

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  creditLimit: number;
  creditBalance: number;
  isActive: boolean;
  createdAt: string;
}

export function useCustomersApi() {
  const isOnline = useOnlineStatus();
  const { data: customers, loading, error, refetch } = useApiData<Customer[]>(
    "/customers",
    {
      autoFetch: isOnline, // Only fetch from server if online
    }
  );

  const createMutation = useMutation<Customer>("POST");
  const updateMutation = useMutation<Customer>("PUT");
  const deleteMutation = useMutation<void>("DELETE");

  const createCustomer = useCallback(
    async (customerData: Omit<Customer, "id" | "createdAt">) => {
      const response = await createMutation.mutate("/customers", customerData, {
        onSuccess: () => refetch(),
      });
      return response;
    },
    [createMutation, refetch]
  );

  const updateCustomer = useCallback(
    async (id: string, customerData: Partial<Customer>) => {
      const response = await updateMutation.mutate(`/customers/${id}`, customerData, {
        onSuccess: () => refetch(),
      });
      return response;
    },
    [updateMutation, refetch]
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      const response = await deleteMutation.mutate(`/customers/${id}`, undefined, {
        onSuccess: () => refetch(),
      });
      return response;
    },
    [deleteMutation, refetch]
  );

  return {
    customers: customers || [],
    loading,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isOnline,
    hasUnsyncedChanges: !isOnline && customers, // Indicator if offline
  };
}

// Hook for fetching single customer
export function useCustomerDetail(customerId: string) {
  const { data, loading, error, refetch } = useApiData<Customer>(
    customerId ? `/customers/${customerId}` : null,
    {
      autoFetch: !!customerId,
    }
  );

  return { customer: data, loading, error, refetch };
}

// Hook for customer search
export function useCustomerSearch(query: string) {
  const { data, loading, error, refetch } = useApiData<Customer[]>(
    query ? `/customers/search?q=${encodeURIComponent(query)}` : null,
    {
      autoFetch: !!query,
    }
  );

  return { results: data || [], loading, error, refetch };
}

// Hook for customer debts
export function useCustomerDebts(customerId: string) {
  const { data: debts, loading, error, refetch } = useApiData(
    `/customers/${customerId}/debts`,
    {
      autoFetch: !!customerId,
    }
  );

  const payDebt = useMutation("POST");

  const payCustomerDebt = useCallback(
    async (debtId: string, amount: number) => {
      const response = await payDebt.mutate(
        `/customers/${customerId}/debts/${debtId}/pay`,
        { amount },
        {
          onSuccess: () => refetch(),
        }
      );
      return response;
    },
    [customerId, payDebt, refetch]
  );

  return { debts, loading, error, refetch, payCustomerDebt };
}

// Hook for purchase history
export function useCustomerPurchaseHistory(customerId: string) {
  const { data, loading, error, refetch } = useApiData(
    customerId ? `/customers/${customerId}/purchase-history` : null,
    {
      autoFetch: !!customerId,
    }
  );

  return { history: data, loading, error, refetch };
}
