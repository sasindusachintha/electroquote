// src/hooks/useMaterials.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../db/client';
import { MaterialRepository } from '../db/repositories/MaterialRepository';
import type { MaterialInput, MaterialWithCategory } from '../types/models';

export const MATERIALS_QUERY_KEY = ['materials'];

export function useMaterials(searchQuery?: string, categoryId?: number) {
  return useQuery({
    queryKey: [...MATERIALS_QUERY_KEY, searchQuery ?? '', categoryId ?? 'all'],
    queryFn: async (): Promise<MaterialWithCategory[]> => {
      const db = await getDatabase();
      const repo = new MaterialRepository(db);

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
  return useQuery({
    queryKey: [...MATERIALS_QUERY_KEY, id],
    queryFn: async (): Promise<MaterialWithCategory | null> => {
      if (!id) return null;
      const db = await getDatabase();
      const repo = new MaterialRepository(db);
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MaterialInput) => {
      const db = await getDatabase();
      const repo = new MaterialRepository(db);
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: MaterialInput }) => {
      const db = await getDatabase();
      const repo = new MaterialRepository(db);
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}

export function useDeactivateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new MaterialRepository(db);
      return repo.deactivate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}
