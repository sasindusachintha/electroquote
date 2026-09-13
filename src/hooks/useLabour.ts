// src/hooks/useLabour.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../db/client';
import { LabourRepository } from '../db/repositories/LabourRepository';
import type { LabourItem, LabourItemInput } from '../types/models';

export const LABOUR_QUERY_KEY = ['labour'];

export function useLabourItems(searchQuery?: string) {
  return useQuery({
    queryKey: [...LABOUR_QUERY_KEY, searchQuery ?? ''],
    queryFn: async (): Promise<LabourItem[]> => {
      const db = await getDatabase();
      const repo = new LabourRepository(db);

      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim());
      }
      return repo.getAll();
    },
  });
}

export function useLabourItem(id?: number) {
  return useQuery({
    queryKey: [...LABOUR_QUERY_KEY, id],
    queryFn: async (): Promise<LabourItem | null> => {
      if (!id) return null;
      const db = await getDatabase();
      const repo = new LabourRepository(db);
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateLabour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LabourItemInput) => {
      const db = await getDatabase();
      const repo = new LabourRepository(db);
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABOUR_QUERY_KEY });
    },
  });
}

export function useUpdateLabour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: LabourItemInput }) => {
      const db = await getDatabase();
      const repo = new LabourRepository(db);
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABOUR_QUERY_KEY });
    },
  });
}

export function useDeactivateLabour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new LabourRepository(db);
      return repo.deactivate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABOUR_QUERY_KEY });
    },
  });
}
