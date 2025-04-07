'use client';

import { useState, useEffect } from 'react';
import { DiseaseRecord } from '@/components/dashboard/disease-table';
import { 
  fetchDiseaseTableData, 
  TablePagination, 
  TableSorting,
  downloadDiseaseDataCsv
} from '@/lib/services/disease-service';
import { DiseaseFilters } from '@/lib/types/api-types';

interface UseDiseaseTableProps {
  initialPage?: number;
  pageSize?: number;
  initialSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  initialFilters?: Partial<DiseaseFilters>;
}

export function useDiseaseTable({
  initialPage = 0,
  pageSize = 10,
  initialSort = { column: 'cases', direction: 'desc' },
  initialFilters = {}
}: UseDiseaseTableProps = {}) {
  // State for data
  const [data, setData] = useState<DiseaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // State for pagination
  const [pagination, setPagination] = useState<TablePagination>({
    pageIndex: initialPage,
    pageSize,
    totalCount: 0
  });
  
  // State for sorting
  const [sorting, setSorting] = useState<TableSorting>(initialSort);
  
  // State for filters
  const [filters, setFilters] = useState<Partial<DiseaseFilters>>(initialFilters);
  
  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchDiseaseTableData(pagination, sorting, filters);
        setData(response.data);
        setPagination(prev => ({
          ...prev,
          totalCount: response.pagination.totalCount
        }));
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch disease table data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, filters]);
  
  // Handler for page change
  const handlePageChange = (pageIndex: number) => {
    setPagination(prev => ({
      ...prev,
      pageIndex
    }));
  };
  
  // Handler for page size change
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      pageIndex: 0 // Reset to first page when changing page size
    }));
  };
  
  // Handler for sorting change
  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    setSorting({ column, direction });
  };
  
  // Handler for filter changes
  const handleFilterChange = (newFilters: Partial<DiseaseFilters>) => {
    setFilters({...newFilters});
    setPagination(prev => ({
      ...prev,
      pageIndex: 0 // Reset to first page when filters change
    }));
  };
  
  // Handler for export
  const handleExport = (filename = 'disease-data.csv') => {
    downloadDiseaseDataCsv(data, filename);
  };
  
  return {
    data,
    isLoading,
    error,
    pagination,
    sorting,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterChange,
    handleExport
  };
} 