import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services";
import { DashboardSummary, DiseaseTrends, MapData } from "@/types/api-types";

// Get dashboard summary data
export function useDashboardSummary(diseaseId?: number) {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary', diseaseId],
    queryFn: async () => {
      const response = await dashboardService.getDashboardSummary(diseaseId);
      return response.data;
    },
  });
}

// Get disease trends data
export function useDashboardTrends() {
  return useQuery<DiseaseTrends>({
    queryKey: ['dashboard-trends'],
    queryFn: async () => {
      const response = await dashboardService.getDashboardTrends();
      return response.data;
    },
  });
}

// Get geographic map data
export function useDashboardMap() {
  return useQuery<MapData>({
    queryKey: ['dashboard-map'],
    queryFn: async () => {
      const response = await dashboardService.getDashboardMap();
      return response.data;
    },
  });
}
