import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diseaseService } from "@/services";
import { Disease, DiseaseFilters, DiseaseInput, DiseaseDataInput } from "@/types/api-types";
import axios from "axios";

// Keys for React Query caching
const DISEASES_QUERY_KEY = "diseases";
const DISEASE_QUERY_KEY = "disease";

// Get all diseases with optional filtering
export function useDiseases(filters?: DiseaseFilters) {
  return useQuery({
    queryKey: [DISEASES_QUERY_KEY, filters],
    queryFn: async () => {
      const { data } = await axios.get('/api/diseases', { params: filters });
      return data;
    },
  });
}

// Get a single disease by ID
export function useDisease(id: number | undefined) {
  return useQuery({
    queryKey: [DISEASE_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await diseaseService.getDiseaseById(id);
      return response.data;
    },
    enabled: !!id, // Only run the query if we have an ID
  });
}

// Create a new disease
export function useCreateDisease() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DiseaseInput) => {
      const response = await diseaseService.createDisease(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the diseases list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [DISEASES_QUERY_KEY] });
    },
  });
}

// Update an existing disease
export function useUpdateDisease() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DiseaseInput }) => {
      const response = await diseaseService.updateDisease(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache for the specific disease
      queryClient.invalidateQueries({ queryKey: [DISEASE_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [DISEASES_QUERY_KEY] });
    },
  });
}

// Delete a disease
export function useDeleteDisease() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await diseaseService.deleteDisease(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove the disease from all relevant caches
      queryClient.removeQueries({ queryKey: [DISEASE_QUERY_KEY, deletedId] });
      queryClient.invalidateQueries({ queryKey: [DISEASES_QUERY_KEY] });
    },
  });
}

// Add disease data
export function useAddDiseaseData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ diseaseId, data }: { diseaseId: number; data: DiseaseDataInput }) => {
      const response = await diseaseService.addDiseaseData(diseaseId, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate disease data after adding new data
      queryClient.invalidateQueries({ queryKey: [DISEASE_QUERY_KEY, variables.diseaseId] });
    },
  });
}

// Get disease prediction
export function useDiseasePrediction(diseaseId: number | undefined, year: number | undefined) {
  return useQuery({
    queryKey: ['disease-prediction', diseaseId, year],
    queryFn: async () => {
      if (!diseaseId || !year) return null;
      const response = await diseaseService.predictDiseaseCases(diseaseId, year);
      return response.data;
    },
    enabled: !!diseaseId && !!year, // Only run the query if we have both parameters
  });
}
