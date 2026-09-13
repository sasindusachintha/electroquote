// src/hooks/useQuotations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { QuotationRepository } from '../db/repositories/QuotationRepository';
import { ReferenceService } from '../services/ReferenceService';
import type { QuotationStatus, QuotationSummary, QuotationDetail } from '../types/models';

export function useQuotations(status?: QuotationStatus) {
  const db = useSQLiteContext();
  const repo = new QuotationRepository(db);

  return useQuery<QuotationSummary[]>({
    queryKey: ['quotations', status ?? 'all'],
    queryFn: () => repo.getAll(status),
  });
}

export function useQuotationDetail(id: number) {
  const db = useSQLiteContext();
  const repo = new QuotationRepository(db);

  return useQuery<QuotationDetail | null>({
    queryKey: ['quotation', id],
    queryFn: () => repo.getById(id),
    enabled: !!id,
  });
}

export function useUpdateQuotationStatus() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new QuotationRepository(db);

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: QuotationStatus }) =>
      repo.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
}

export function useUpdateQuotationPdfMode() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new QuotationRepository(db);

  return useMutation({
    mutationFn: ({ id, pdfMode }: { id: number; pdfMode: 'detailed' | 'simple' }) =>
      repo.updatePdfMode(id, pdfMode),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
}

export function useDeleteQuotation() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new QuotationRepository(db);

  return useMutation({
    mutationFn: (id: number) => repo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

export function useDuplicateQuotation() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const repo = new QuotationRepository(db);

  return useMutation({
    mutationFn: async (id: number) => {
      const newRef = await ReferenceService.next(db);
      return repo.duplicate(id, newRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}
