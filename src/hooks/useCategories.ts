// src/hooks/useCategories.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialRepository } from '../db/repositories/MaterialRepository';
import type { MaterialCategory } from '../types/models';

export const CATEGORIES_QUERY_KEY = ['material_categories'];

export function useCategories() {
  const db = useSQLiteContext();
  const repo = new MaterialRepository(db);

  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async (): Promise<MaterialCategory[]> => {
      return repo.getAllCategories();
    },
  });
}

export function useCreateCategory() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new MaterialRepository(db);

  return useMutation({
    mutationFn: async (input: { name: string; defaultMarkupPct: number; sortOrder?: number }) => {
      return repo.createCategory(input.name, input.defaultMarkupPct, input.sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
