// src/hooks/useCustomers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { CustomerRepository } from '../db/repositories/CustomerRepository';
import type { Customer, CustomerInput } from '../types/models';

export const CUSTOMERS_QUERY_KEY = ['customers'];

export function useCustomers(searchQuery?: string, includeArchived = false) {
  const db = useSQLiteContext();
  const repo = new CustomerRepository(db);

  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, searchQuery ?? '', includeArchived],
    queryFn: async (): Promise<Customer[]> => {
      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim());
      }
      return repo.getAll(includeArchived);
    },
  });
}

export function useCustomer(id?: number) {
  const db = useSQLiteContext();
  const repo = new CustomerRepository(db);

  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new CustomerRepository(db);

  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new CustomerRepository(db);

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: CustomerInput }) => {
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useArchiveCustomer() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new CustomerRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useDeleteCustomer() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new CustomerRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
