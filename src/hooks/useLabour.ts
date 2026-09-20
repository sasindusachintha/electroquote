// src/hooks/useLabour.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { LabourRepository } from '../db/repositories/LabourRepository';
import type { LabourItem, LabourItemInput } from '../types/models';

export const LABOUR_QUERY_KEY = ['labour'];

export function useLabourItems(searchQuery?: string) {
  const db = useSQLiteContext();
  const repo = new LabourRepository(db);

  return useQuery({
    queryKey: [...LABOUR_QUERY_KEY, searchQuery ?? ''],
    queryFn: async (): Promise<LabourItem[]> => {
      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim());
      }
      return repo.getAll();
    },
  });
}

export function useLabourItem(id?: number) {
  const db = useSQLiteContext();
  const repo = new LabourRepository(db);

  return useQuery({
    queryKey: [...LABOUR_QUERY_KEY, id],
    queryFn: async (): Promise<LabourItem | null> => {
      if (!id) return null;
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateLabour() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new LabourRepository(db);

  return useMutation({
    mutationFn: async (input: LabourItemInput) => {
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABOUR_QUERY_KEY });
    },
  });
}

export function useUpdateLabour() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new LabourRepository(db);

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: LabourItemInput }) => {
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABOUR_QUERY_KEY });
    },
  });
}

export function useDeactivateLabour() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new LabourRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.deactivate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LABOUR_QUERY_KEY });
    },
  });
}
