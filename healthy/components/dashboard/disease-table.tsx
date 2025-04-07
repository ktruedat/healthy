"use client";

import * as React from "react";
import { 
  ColumnDef, 
  ColumnFiltersState,
  SortingState, 
  VisibilityState,
  flexRender, 
  getCoreRowModel, 
  getFilteredRowModel,
  getPaginationRowModel, 
  getSortedRowModel, 
  useReactTable
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  ListFilter,
  Search
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";

// Disease type from API
export interface DiseaseRecord {
  id: number;
  name: string;
  category: string;
  year: number;
  quarter: number;
  region: string;
  cases: number;
  deaths: number;
  recoveries: number;
  population?: number;
  incidenceRate: number;
  prevalenceRate: number;
  mortalityRate: number;
}

// Props for the table component
interface DiseaseTableProps {
  data: DiseaseRecord[];
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  };
  onPageChange?: (pageIndex: number) => void;
  onRowClick?: (disease: DiseaseRecord) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: any) => void;
  onExport?: () => void;
}

// Utility formatters
const formatters = {
  // Format number with thousands separators
  number: (value: number): string => {
    return value?.toLocaleString() || '0';
  },
  
  // Format as percentage with 2 decimal places
  percentage: (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  },
  
  // Format as rate per 100,000 population
  rate: (value: number): string => {
    return `${value.toFixed(2)}`;
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
  onPageChange,
  onRowClick,
  onSort,
  onFilter,
  onExport
}: DiseaseTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Add media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  // Define table columns
  const columns: ColumnDef<DiseaseRecord>[] = [
    {
      accessorKey: "name",
      header: "Disease",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.getValue("category")}
        </Badge>
      ),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => formatters.period(row.original.year, row.original.quarter),
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => row.getValue("region"),
      enableHiding: true,
    },
    {
      accessorKey: "cases",
      header: "Cases",
      cell: ({ row }) => formatters.number(row.getValue("cases")),
      meta: {
        className: "text-right"
      },
    },
    {
      accessorKey: "deaths",
      header: "Deaths",
      cell: ({ row }) => formatters.number(row.getValue("deaths")),
      meta: {
        className: "text-right"
      },
      enableHiding: true,
    },
    {
      accessorKey: "recoveries",
      header: "Recoveries",
      cell: ({ row }) => formatters.number(row.getValue("recoveries")),
      meta: {
        className: "text-right"
      },
      enableHiding: true,
    },
    {
      accessorKey: "incidenceRate",
      header: "Incidence Rate",
      cell: ({ row }) => formatters.rate(row.getValue("incidenceRate")),
      meta: {
        className: "text-right"
      },
      enableHiding: true,
    },
    {
      accessorKey: "mortalityRate",
      header: "Mortality Rate",
      cell: ({ row }) => formatters.percentage(row.getValue("mortalityRate") / 100),
      meta: {
        className: "text-right"
      },
      enableHiding: true,
    },
  ];

  // Set initial column visibility based on screen size
  React.useEffect(() => {
    setColumnVisibility({
      region: !isMobile,
      deaths: !isMobile,
      recoveries: !isTablet,
      incidenceRate: !isTablet,
      mortalityRate: !isTablet,
    });
  }, [isMobile, isTablet]);

  // Setup table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSort && newSorting.length > 0) {
        onSort(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc');
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    table.getColumn("name")?.setFilterValue(value);
  };

  // Handle row click
  const handleRowClick = (row: DiseaseRecord) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Handle pagination controls
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      table.setPageIndex(page);
    }
  };

  // Calculate visible pages for pagination
  const totalPages = pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : table.getPageCount();
  const currentPage = pagination ? pagination.pageIndex : table.getState().pagination.pageIndex;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Disease Data</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diseases..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
                <ListFilter className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={
                        header.column.columnDef.meta?.className as string
                      }>
                        {header.isPlaceholder
                          ? null
                          : (
                            <div 
                              className={
                                header.column.getCanSort() 
                                  ? "flex items-center justify-between cursor-pointer select-none" 
                                  : ""
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && (
                                <ChevronDown 
                                  className={`ml-2 h-4 w-4 ${
                                    header.column.getIsSorted() === "asc" ? "rotate-180 transform" : 
                                    header.column.getIsSorted() === "desc" ? "" : 
                                    "opacity-0"
                                  }`}
                                />
                              )}
                            </div>
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className as string}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {pagination?.totalCount || data.length} records
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage + 1} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage + 1 === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage + 1 === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 