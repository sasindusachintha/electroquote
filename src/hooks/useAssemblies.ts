// src/hooks/useAssemblies.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../db/client';
import { AssemblyRepository } from '../db/repositories/AssemblyRepository';
import type { AssemblyDetail, AssemblyInput } from '../types/models';

export const ASSEMBLIES_QUERY_KEY = ['assemblies'];

export function useAssemblies(searchQuery?: string, categoryId?: number) {
  return useQuery({
    queryKey: [...ASSEMBLIES_QUERY_KEY, searchQuery ?? '', categoryId ?? 'all'],
    queryFn: async (): Promise<AssemblyDetail[]> => {
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);

      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim(), categoryId);
      }
      return repo.getAll();
    },
  });
}

export function useAssembly(id?: number) {
  return useQuery({
    queryKey: [...ASSEMBLIES_QUERY_KEY, id],
    queryFn: async (): Promise<AssemblyDetail | null> => {
      if (!id) return null;
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AssemblyInput) => {
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useUpdateAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: AssemblyInput }) => {
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useDuplicateAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);
      return repo.duplicate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useToggleFavouriteAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);
      return repo.toggleFavourite(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useDeactivateAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new AssemblyRepository(db);
      return repo.deactivate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}
