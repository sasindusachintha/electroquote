// src/hooks/useCustomers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../db/client';
import { CustomerRepository } from '../db/repositories/CustomerRepository';
import type { Customer, CustomerInput } from '../types/models';

export const CUSTOMERS_QUERY_KEY = ['customers'];

export function useCustomers(searchQuery?: string, includeArchived = false) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, searchQuery ?? '', includeArchived],
    queryFn: async (): Promise<Customer[]> => {
      const db = await getDatabase();
      const repo = new CustomerRepository(db);

      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim());
      }
      return repo.getAll(includeArchived);
    },
  });
}

export function useCustomer(id?: number) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      const db = await getDatabase();
      const repo = new CustomerRepository(db);
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      const db = await getDatabase();
      const repo = new CustomerRepository(db);
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: CustomerInput }) => {
      const db = await getDatabase();
      const repo = new CustomerRepository(db);
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useArchiveCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new CustomerRepository(db);
      return repo.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new CustomerRepository(db);
      return repo.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
