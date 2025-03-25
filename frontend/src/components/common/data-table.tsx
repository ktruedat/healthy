"use client";

import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/error-states";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface PaginationOptions {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  hasMore?: boolean; // Add this field
}

export interface SortingState {
  column: string | null;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: PaginationOptions;
  onRowClick?: (row: T) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortingState?: SortingState;
  emptyStateMessage?: string;
  loadingRowsCount?: number;
  className?: string;
}

// Add helper function for truncating text
const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return `${text.substring(0, limit)}...`;
};

// Add TruncatedText component
const TruncatedText = ({ text, limit = 30 }: { text: string; limit?: number }) => {
  if (text.length <= limit) {
    return <span>{text}</span>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="cursor-help">{truncateText(text, limit)}</span>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85 shadow-lg rounded-md border px-3 py-1.5 text-sm text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={4}
        >
          <p className="max-w-xs break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function DataTable<T extends object>({
  data,
  columns,
  isLoading = false,
  pagination,
  onRowClick,
  onSort,
  sortingState,
  emptyStateMessage = "No data available",
  loadingRowsCount = 5,
  className,
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    const columnKey = typeof column.accessorKey === 'string' ? column.accessorKey.toString() : '';
    
    if (sortingState?.column === columnKey) {
      // Toggle direction if same column
      onSort(columnKey, sortingState.direction === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new column
      onSort(columnKey, 'asc');
    }
  };
  
  // Calculate pagination details
  const totalPages = pagination 
    ? pagination.hasMore 
      ? Math.max(pagination.pageIndex + 2, Math.ceil(pagination.totalCount / pagination.pageSize))
      : Math.ceil(pagination.totalCount / pagination.pageSize)
    : 0;
    
  const startItem = pagination 
    ? pagination.pageIndex * pagination.pageSize + 1 
    : 0;
    
  const endItem = pagination 
    ? Math.min(startItem + pagination.pageSize - 1, pagination.totalCount)
    : 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-screen-sm mx-auto">
        <div className="rounded-md border">
          <Table className={className}>
            <TableHeader>
              <TableRow>
                {columns.map((column, i) => (
                  <TableHead key={i} className={column.className}>
                    <Skeleton className="h-6 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: loadingRowsCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No data"
        description={emptyStateMessage}
      />
    );
  }

  // Add explicit click handlers for pagination buttons
  const handleFirstPageClick = () => {
    if (pagination && pagination.onPageChange && pagination.pageIndex !== 0) {
      pagination.onPageChange(0);
    }
  };

  const handlePreviousPageClick = () => {
    if (pagination && pagination.onPageChange && pagination.pageIndex > 0) {
      pagination.onPageChange(pagination.pageIndex - 1);
    }
  };

  const handleNextPageClick = () => {
    if (pagination && pagination.onPageChange && 
        (pagination.hasMore || pagination.pageIndex < totalPages - 1)) {
      pagination.onPageChange(pagination.pageIndex + 1);
    }
  };

  const handleLastPageClick = () => {
    if (pagination && pagination.onPageChange && pagination.pageIndex !== totalPages - 1) {
      pagination.onPageChange(totalPages - 1);
    }
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-accent/50 select-none",
                    column.className
                  )}
                  onClick={column.sortable ? () => handleSort(column) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortingState && typeof column.accessorKey === 'string' && 
                     sortingState.column === column.accessorKey && (
                      <span className="ml-1">
                        {sortingState.direction === 'asc' ? 
                          <ArrowUp className="h-3.5 w-3.5" /> : 
                          <ArrowDown className="h-3.5 w-3.5" />
                        }
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex} 
                className={cn(onRowClick && "cursor-pointer hover:bg-accent/50")}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  // Use the cell renderer if provided
                  if (column.cell) {
                    return (
                      <TableCell key={colIndex} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    );
                  }
                  
                  // Otherwise, access the value directly
                  let value: any;
                  if (typeof column.accessorKey === 'function') {
                    value = column.accessorKey(row);
                  } else {
                    value = row[column.accessorKey];
                  }
                  
                  return (
                    <TableCell key={colIndex} className={column.className}>
                      <TruncatedText text={value?.toString() || ''} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {pagination && totalPages > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {pagination.totalCount}{pagination.hasMore ? "+" : ""} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFirstPageClick}
              disabled={pagination.pageIndex === 0}
              className="cursor-pointer hover:bg-accent/50 active:bg-accent"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviousPageClick}
              disabled={pagination.pageIndex === 0}
              className="cursor-pointer hover:bg-accent/50 active:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {pagination.pageIndex + 1} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextPageClick}
              disabled={!pagination.hasMore && pagination.pageIndex >= totalPages - 1}
              className="cursor-pointer hover:bg-accent/50 active:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLastPageClick}
              disabled={pagination.pageIndex >= totalPages - 1}
              className="cursor-pointer hover:bg-accent/50 active:bg-accent"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
