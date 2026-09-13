// src/hooks/useCategories.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../db/client';
import { MaterialRepository } from '../db/repositories/MaterialRepository';
import type { MaterialCategory } from '../types/models';

export const CATEGORIES_QUERY_KEY = ['material_categories'];

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async (): Promise<MaterialCategory[]> => {
      const db = await getDatabase();
      const repo = new MaterialRepository(db);
      return repo.getAllCategories();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; defaultMarkupPct: number; sortOrder?: number }) => {
      const db = await getDatabase();
      const repo = new MaterialRepository(db);
      return repo.createCategory(input.name, input.defaultMarkupPct, input.sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
