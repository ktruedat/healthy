import { get, post, patch, del, ApiResponse } from './api-client';
import { Disease, DiseaseInput, DiseaseData, DiseaseDataInput, DiseaseFilters } from '@/types/api-types';

// Get all diseases with optional filters
export const getDiseases = async (filters?: DiseaseFilters): Promise<ApiResponse<Disease[]>> => {
  return await get<Disease[]>('/diseases', filters);
};

// Get a disease by ID
export const getDiseaseById = async (id: number): Promise<ApiResponse<Disease>> => {
  return await get<Disease>(`/diseases/${id}`);
};

// Create a new disease
export const createDisease = async (data: DiseaseInput): Promise<ApiResponse<Disease>> => {
  return await post<Disease>('/diseases', data);
};

// Update a disease
export const updateDisease = async (id: number, data: DiseaseInput): Promise<ApiResponse<Disease>> => {
  return await patch<Disease>(`/diseases/${id}`, data);
};

// Delete a disease
export const deleteDisease = async (id: number): Promise<ApiResponse<void>> => {
  return await del<void>(`/diseases/${id}`);
};

// Add new disease data
export const addDiseaseData = async (diseaseId: number, data: DiseaseDataInput): Promise<ApiResponse<DiseaseData>> => {
  return await post<DiseaseData>(`/diseases/${diseaseId}/data`, data);
};

// Get disease prediction
export const predictDiseaseCases = async (diseaseId: number, year: number): Promise<ApiResponse<any>> => {
  return await get<any>(`/diseases/${diseaseId}/predict`, { year });
};
