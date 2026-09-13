// src/hooks/useProjects.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../db/client';
import { ProjectRepository } from '../db/repositories/ProjectRepository';
import type { ProjectWithCustomer, ProjectInput, ProjectStatus } from '../types/models';

export const PROJECTS_QUERY_KEY = ['projects'];

export function useProjects(searchQuery?: string, customerId?: number, includeArchived = false) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, searchQuery ?? '', customerId ?? 'all', includeArchived],
    queryFn: async (): Promise<ProjectWithCustomer[]> => {
      const db = await getDatabase();
      const repo = new ProjectRepository(db);

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
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: async (): Promise<ProjectWithCustomer | null> => {
      if (!id) return null;
      const db = await getDatabase();
      const repo = new ProjectRepository(db);
      return repo.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const db = await getDatabase();
      const repo = new ProjectRepository(db);
      return repo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ProjectInput }) => {
      const db = await getDatabase();
      const repo = new ProjectRepository(db);
      return repo.update(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ProjectStatus }) => {
      const db = await getDatabase();
      const repo = new ProjectRepository(db);
      return repo.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new ProjectRepository(db);
      return repo.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      const repo = new ProjectRepository(db);
      return repo.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}
