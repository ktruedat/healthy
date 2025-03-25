import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services";
import { Category, CategoryInput } from "@/types/api-types";

// Keys for React Query caching
const CATEGORIES_QUERY_KEY = "categories";
const CATEGORY_QUERY_KEY = "category";

// Get all categories
export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const response = await categoryService.getCategories();
      return response.data;
    },
  });
}

// Get a single category by ID
export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await categoryService.getCategoryById(id);
      return response.data;
    },
    enabled: !!id, // Only run the query if we have an ID
  });
}

// Get diseases by category
export function useDiseasesByCategory(categoryId: number | undefined) {
  return useQuery({
    queryKey: ['category-diseases', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await categoryService.getDiseasesByCategory(categoryId);
      return response.data;
    },
    enabled: !!categoryId, // Only run the query if we have a category ID
  });
}

// Create a new category
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CategoryInput) => {
      const response = await categoryService.createCategory(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the categories list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}

// Update an existing category
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryInput }) => {
      const response = await categoryService.updateCategory(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache for the specific category
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}

// Delete a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await categoryService.deleteCategory(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove the category from all relevant caches
      queryClient.removeQueries({ queryKey: [CATEGORY_QUERY_KEY, deletedId] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}
