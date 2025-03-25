"use client";

import React from "react";
import { DataTable, Column } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";

// Define the Disease interface according to our API response
export interface Disease {
  id: string;
  name: string;
  category: string;
  year: number;
  quarter: number;
  region: string;
  cases: number;
  deaths: number;
  recoveries: number;
  population: number;
  incidenceRate: number;
  prevalenceRate: number;
  mortalityRate: number;
}

interface DiseaseTableProps {
  data: Disease[];
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (pageIndex: number) => void;
  };
  onDiseaseClick?: (disease: Disease) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortingState?: { column: string | null; direction: 'asc' | 'desc' };
}

// Utility formatters
const formatters = {
  // Format number with thousands separators
  number: (value: number): string => {
    return value.toLocaleString();
  },
  
  // Format as percentage with 2 decimal places
  percentage: (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  },
  
  // Format as rate per 100,000 population
  rate: (value: number): string => {
    return `${value.toFixed(2)} per 100,000`;
  },

  // Format quarter and year (e.g., "Q3 2024")
  period: (year: number, quarter: number): string => {
    return `Q${quarter} ${year}`;
  }
};

export function DiseaseTable({
  data,
  isLoading = false,
  pagination,
  onDiseaseClick,
  onSort,
  sortingState,
}: DiseaseTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const columns: Column<Disease>[] = [
    {
      header: "Disease",
      accessorKey: "name",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <Badge variant="outline" className="font-normal">
          {row.category}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Period",
      accessorKey: (row) => formatters.period(row.year, row.quarter),
      sortable: true,
      className: isMobile ? "hidden md:table-cell" : "",
    },
    {
      header: "Cases",
      accessorKey: "cases",
      cell: (row) => formatters.number(row.cases),
      className: "text-right",
      sortable: true,
    },
    {
      header: "Deaths",
      accessorKey: "deaths",
      cell: (row) => formatters.number(row.deaths),
      className: "text-right hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Recoveries",
      accessorKey: "recoveries",
      cell: (row) => formatters.number(row.recoveries),
      className: "text-right hidden lg:table-cell",
      sortable: true,
    },
    {
      header: "Inc. Rate",
      accessorKey: "incidenceRate",
      cell: (row) => formatters.rate(row.incidenceRate),
      className: "text-right",
      sortable: true,
    },
    {
      header: "Mortality",
      accessorKey: "mortalityRate",
      cell: (row) => formatters.percentage(row.mortalityRate / 100), // Assuming mortalityRate is already in percentage form
      className: "text-right hidden md:table-cell",
      sortable: true,
    }
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      onRowClick={onDiseaseClick}
      onSort={onSort}
      sortingState={sortingState}
      emptyStateMessage="No disease data available. Please adjust your filters or try again later."
      className="w-full"
    />
  );
}
