// src/hooks/useBusinessProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { BusinessProfileRepository } from '../db/repositories/BusinessProfileRepository';
import type { BusinessProfile, BusinessProfileInput } from '../types/models';

export function useBusinessProfile() {
  const db = useSQLiteContext();
  const repo = new BusinessProfileRepository(db);

  return useQuery<BusinessProfile>({
    queryKey: ['businessProfile'],
    queryFn: () => repo.get(),
  });
}

export function useUpdateBusinessProfile() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new BusinessProfileRepository(db);

  return useMutation({
    mutationFn: (input: BusinessProfileInput) => repo.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}
