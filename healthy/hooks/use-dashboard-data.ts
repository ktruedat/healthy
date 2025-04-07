'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getDashboardTrends, getDashboardMap } from '@/lib/services/dashboard-service';

// Hook for fetching dashboard summary
export function useDashboardSummary(diseaseId?: number) {
  return useQuery({
    queryKey: ['dashboard-summary', diseaseId],
    queryFn: () => getDashboardSummary(diseaseId),
  });
}

// Hook for fetching dashboard trends
export function useDashboardTrends() {
  return useQuery({
    queryKey: ['dashboard-trends'],
    queryFn: () => getDashboardTrends(),
  });
}

// Hook for fetching dashboard map data
export function useDashboardMap() {
  return useQuery({
    queryKey: ['dashboard-map'],
    queryFn: () => getDashboardMap(),
  });
} 