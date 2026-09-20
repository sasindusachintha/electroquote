// src/hooks/useAssemblies.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { AssemblyRepository } from '../db/repositories/AssemblyRepository';
import type { AssemblyDetail, AssemblyInput } from '../types/models';

export const ASSEMBLIES_QUERY_KEY = ['assemblies'];

export function useAssemblies(searchQuery?: string, categoryId?: number) {
  const db = useSQLiteContext();
  const repo = new AssemblyRepository(db);

  return useQuery({
    queryKey: [...ASSEMBLIES_QUERY_KEY, searchQuery ?? '', categoryId ?? 'all'],
    queryFn: async (): Promise<AssemblyDetail[]> => {
      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim(), categoryId);
      }
      return repo.getAll();
    },
  });
}

export function useAssembly(id?: number) {
  const db = useSQLiteContext();
  const repo = new AssemblyRepository(db);

  return useQuery({
    queryKey: [...ASSEMBLIES_QUERY_KEY, id],
    queryFn: async (): Promise<AssemblyDetail | null> => {
      if (!id) return null;
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateAssembly() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new AssemblyRepository(db);

  return useMutation({
    mutationFn: async (input: AssemblyInput) => {
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useUpdateAssembly() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new AssemblyRepository(db);

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: AssemblyInput }) => {
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useDuplicateAssembly() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new AssemblyRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.duplicate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useToggleFavouriteAssembly() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new AssemblyRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.toggleFavourite(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}

export function useDeactivateAssembly() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new AssemblyRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.deactivate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSEMBLIES_QUERY_KEY });
    },
  });
}
