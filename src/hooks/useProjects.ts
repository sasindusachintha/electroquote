// src/hooks/useProjects.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { ProjectRepository } from '../db/repositories/ProjectRepository';
import type { ProjectWithCustomer, ProjectInput, ProjectStatus } from '../types/models';

export const PROJECTS_QUERY_KEY = ['projects'];

export function useProjects(searchQuery?: string, customerId?: number, includeArchived = false) {
  const db = useSQLiteContext();
  const repo = new ProjectRepository(db);

  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, searchQuery ?? '', customerId ?? 'all', includeArchived],
    queryFn: async (): Promise<ProjectWithCustomer[]> => {
      if (searchQuery && searchQuery.trim().length > 0) {
        return repo.search(searchQuery.trim(), customerId);
      }
      if (customerId != null) {
        return repo.getByCustomerId(customerId, includeArchived);
      }
      return repo.getAll(includeArchived);
    },
  });
}

export function useProject(id?: number) {
  const db = useSQLiteContext();
  const repo = new ProjectRepository(db);

  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: async (): Promise<ProjectWithCustomer | null> => {
      if (!id) return null;
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new ProjectRepository(db);

  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProject() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new ProjectRepository(db);

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ProjectInput }) => {
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProjectStatus() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new ProjectRepository(db);

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ProjectStatus }) => {
      return repo.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useArchiveProject() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new ProjectRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useDeleteProject() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new ProjectRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      return repo.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}
