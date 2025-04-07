'use client';

import { AppSidebar } from "@/components/app-sidebar"
import { StatsCardGrid } from "@/components/dashboard/stats-grid"
import { DiseaseChart } from "@/components/dashboard/disease-chart"
import { DiseaseTable } from "@/components/dashboard/disease-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useDiseaseTable } from '@/hooks/use-disease-table';

export default function Page() {
  // Use our custom hook for the disease table
  const {
    data: diseaseData,
    isLoading,
    pagination,
    handlePageChange,
    handleSortChange,
    handleExport
  } = useDiseaseTable({
    pageSize: 5,
    initialSort: { column: 'cases', direction: 'desc' }
  });

  // Handle row click
  const handleRowClick = (disease: any) => {
    console.log('Selected disease:', disease);
    // Here you could navigate to a detail page or open a modal
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <StatsCardGrid />
              </div>
              <div className="px-4 lg:px-6">
                <DiseaseChart simplified height={350} />
              </div>
              <div className="px-4 lg:px-6">
                <DiseaseTable 
                  data={diseaseData}
                  isLoading={isLoading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onSort={handleSortChange}
                  onRowClick={handleRowClick}
                  onExport={handleExport}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
