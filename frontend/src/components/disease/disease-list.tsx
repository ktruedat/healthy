"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DiseaseTable, Disease } from "@/components/disease/disease-table";
import { useDiseaseList } from "@/hooks/use-diseases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/common/error-states";
import { Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DiseaseList() {
  const router = useRouter();
  const {
    diseases,
    totalCount,
    hasMore,
    isLoading,
    error,
    page,
    pageSize,
    search,
    sortingState,
    handlePageChange,
    handleSearch,
    handleSort,
  } = useDiseaseList({
    initialPage: 0,
    pageSize: 10,
  });

  // Handler for disease selection
  const handleDiseaseClick = (disease: Disease) => {
    router.push(`/diseases/${disease.id}`);
  };

  // Debounced search handler
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timer = setTimeout(() => {
      handleSearch(e.target.value);
    }, 300);

    return () => clearTimeout(timer);
  };

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load diseases"
        description="There was a problem loading the disease data. Please try again later."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disease Registry</CardTitle>
        <CardDescription>
          Browse and manage infectious disease data across regions.
        </CardDescription>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search diseases..."
              className="pl-8"
              defaultValue={search}
              onChange={handleSearchInput}
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DiseaseTable
          data={diseases}
          isLoading={isLoading}
          onDiseaseClick={handleDiseaseClick}
          onSort={handleSort}
          sortingState={sortingState}
          pagination={{
            pageIndex: page,
            pageSize: pageSize,
            totalCount: totalCount,
            onPageChange: handlePageChange,
            hasMore: hasMore, // Add this to the pagination props
          }}
        />
      </CardContent>
    </Card>
  );
}
