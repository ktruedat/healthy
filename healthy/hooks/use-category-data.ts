'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getDiseasesByCategory
} from '@/lib/services/category-service';
import { CategoryInput } from '@/lib/types/api-types';

// Hook for fetching all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
}

// Hook for fetching a specific category by ID
export function useCategory(id: number) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
}

// Hook for creating a new category
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CategoryInput) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Hook for updating a category
export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CategoryInput) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
    },
  });
}

// Hook for deleting a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Hook for getting diseases by category
export function useDiseasesByCategory(categoryId: number) {
  return useQuery({
    queryKey: ['diseases-by-category', categoryId],
    queryFn: () => getDiseasesByCategory(categoryId),
    enabled: !!categoryId,
  });
} 