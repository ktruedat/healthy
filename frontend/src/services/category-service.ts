import { get, post, patch, del, ApiResponse } from './api-client';
import { Category, CategoryInput, Disease } from '@/types/api-types';

// Get all categories
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  return await get<Category[]>('/categories');
};

// Get a category by ID
export const getCategoryById = async (id: number): Promise<ApiResponse<Category>> => {
  return await get<Category>(`/categories/${id}`);
};

// Create a new category
export const createCategory = async (data: CategoryInput): Promise<ApiResponse<Category>> => {
  return await post<Category>('/categories', data);
};

// Update a category
export const updateCategory = async (id: number, data: CategoryInput): Promise<ApiResponse<Category>> => {
  return await patch<Category>(`/categories/${id}`, data);
};

// Delete a category
export const deleteCategory = async (id: number): Promise<ApiResponse<void>> => {
  return await del<void>(`/categories/${id}`);
};

// Get diseases by category
export const getDiseasesByCategory = async (id: number): Promise<ApiResponse<Disease[]>> => {
  return await get<Disease[]>(`/categories/${id}/diseases`);
};
