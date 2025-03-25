"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Simple page changing handlers
  const goToFirstPage = () => onPageChange(0);
  const goToPreviousPage = () => onPageChange(Math.max(0, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages - 1, currentPage + 1));
  const goToLastPage = () => onPageChange(Math.max(0, totalPages - 1));

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="text-sm text-muted-foreground mr-4">
        Page {currentPage + 1} of {totalPages}
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={goToFirstPage}
        disabled={currentPage === 0}
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={goToPreviousPage}
        disabled={currentPage === 0}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={goToNextPage}
        disabled={currentPage >= totalPages - 1}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={goToLastPage}
        disabled={currentPage >= totalPages - 1}
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
