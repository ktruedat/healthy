import { get, ApiResponse } from './api-client';
import { DashboardSummary, DiseaseTrends, MapData } from '@/types/api-types';

// Get dashboard summary data
export const getDashboardSummary = async (diseaseId?: number): Promise<ApiResponse<DashboardSummary>> => {
  const params = diseaseId ? { diseaseID: diseaseId } : undefined;
  return await get<DashboardSummary>('/dashboard/summary', params);
};

// Get disease trends data
export const getDashboardTrends = async (): Promise<ApiResponse<DiseaseTrends>> => {
  return await get<DiseaseTrends>('/dashboard/trends');
};

// Get geographic map data
export const getDashboardMap = async (): Promise<ApiResponse<MapData>> => {
  return await get<MapData>('/dashboard/map');
};
