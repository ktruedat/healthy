'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDiseases, 
  getDiseaseById, 
  createDisease, 
  updateDisease, 
  deleteDisease,
  addDiseaseData,
  predictDiseaseCases
} from '@/lib/services/disease-service';
import { Disease, DiseaseFilters, DiseaseInput, DiseaseDataInput } from '@/lib/types/api-types';

// Hook for fetching diseases with optional filters
export function useDiseases(filters?: DiseaseFilters) {
  return useQuery({
    queryKey: ['diseases', filters],
    queryFn: () => getDiseases(filters),
  });
}

// Hook for fetching a specific disease by ID
export function useDisease(id: number) {
  return useQuery({
    queryKey: ['disease', id],
    queryFn: () => getDiseaseById(id),
    enabled: !!id,
  });
}

// Hook for creating a new disease
export function useCreateDisease() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DiseaseInput) => createDisease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
    },
  });
}

// Hook for updating a disease
export function useUpdateDisease(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DiseaseInput) => updateDisease(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
      queryClient.invalidateQueries({ queryKey: ['disease', id] });
    },
  });
}

// Hook for deleting a disease
export function useDeleteDisease() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteDisease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
    },
  });
}

// Hook for adding disease data
export function useAddDiseaseData(diseaseId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DiseaseDataInput) => addDiseaseData(diseaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disease', diseaseId] });
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
    },
  });
}

// Hook for getting disease predictions
export function useDiseasePredict(diseaseId: number, year: number) {
  return useQuery({
    queryKey: ['disease-predict', diseaseId, year],
    queryFn: () => predictDiseaseCases(diseaseId, year),
    enabled: !!diseaseId && !!year,
  });
} 