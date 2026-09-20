// src/hooks/useMaterials.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialRepository } from '../db/repositories/MaterialRepository';
import type { MaterialInput, MaterialWithCategory } from '../types/models';

export const MATERIALS_QUERY_KEY = ['materials'];

export function useMaterials(searchQuery?: string, categoryId?: number) {
  const db = useSQLiteContext();
  const repo = new MaterialRepository(db);

  return useQuery({
    queryKey: [...MATERIALS_QUERY_KEY, searchQuery ?? '', categoryId ?? 'all'],
    queryFn: async (): Promise<MaterialWithCategory[]> => {
      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim(), categoryId);
      }
      if (categoryId != null && categoryId > 0) {
        return repo.getByCategory(categoryId);
      }
      return repo.getAll();
    },
  });
}

export function useMaterial(id?: number) {
  const db = useSQLiteContext();
  const repo = new MaterialRepository(db);

  return useQuery({
    queryKey: [...MATERIALS_QUERY_KEY, id],
    queryFn: async (): Promise<MaterialWithCategory | null> => {
      if (!id) return null;
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateMaterial() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new MaterialRepository(db);

  return useMutation({
    mutationFn: async (input: MaterialInput) => {
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}

export function useUpdateMaterial() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new MaterialRepository(db);

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: MaterialInput }) => {
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}

export function useDeactivateMaterial() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new MaterialRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.deactivate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}
