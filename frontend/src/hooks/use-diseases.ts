import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Disease } from '@/components/disease/disease-table';
import { SortingState } from '@/components/common/data-table';

interface UseDiseaseListProps {
  initialPage?: number;
  pageSize?: number;
  initialSearch?: string;
}

interface DiseaseListResponse {
  diseases: Disease[];
  totalCount: number;
  hasMore?: boolean; // Add this field to the response type
  page: number;
  limit: number;
}

export function useDiseaseList({
  initialPage = 0,
  pageSize = 10,
  initialSearch = '',
}: UseDiseaseListProps = {}) {
  // State for pagination and filters
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [sortingState, setSortingState] = useState<SortingState>({
    column: null,
    direction: 'asc',
  });
  
  // Query for fetching diseases with pagination and search
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<DiseaseListResponse>({
    queryKey: ['diseases', page, pageSize, search, sortingState],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());
      
      if (search) {
        params.set('search', search);
      }
      
      if (sortingState.column) {
        params.set('sortBy', sortingState.column);
        params.set('sortOrder', sortingState.direction);
      }

      console.log('Fetching with params:', params.toString()); // Debug log
      
      const response = await fetch(`/api/diseases?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch diseases');
      }
      
      return await response.json();
    },
    keepPreviousData: true, // Keep previous data while fetching new data
  });
  
  // Simplified page change handler
  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    setPage(newPage);
    refetch(); // Force refetch when page changes
  };
  
  // Handler for search changes
  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(0); // Reset to first page when search changes
  };
  
  // Handler for sorting changes
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortingState({ column, direction });
  };
  
  // Calculate estimated total pages based on hasMore flag
  const estimatedTotalPages = data?.hasMore 
    ? Math.max(page + 2, Math.ceil((data?.totalCount || 0) / pageSize))
    : Math.ceil((data?.totalCount || 0) / pageSize);
  
  // Handle next page specially when using hasMore
  const handleNextPage = () => {
    if (data?.hasMore || (data?.totalCount && (page + 1) * pageSize < data.totalCount)) {
      setPage(page + 1);
      refetch();
    }
  };
  
  return {
    diseases: data?.diseases || [],
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    page,
    pageSize,
    search,
    sortingState,
    handlePageChange,
    handleSearch,
    handleSort,
    handleNextPage,
    estimatedTotalPages
  };
}
