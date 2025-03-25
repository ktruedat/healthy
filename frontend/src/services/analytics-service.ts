import { get, post, ApiResponse } from './api-client';
import { 
  ForecastRequest, 
  ForecastResponse,
  CorrelationRequest,
  CorrelationResult,
  DiseaseQuery,
  QueryResult
} from '@/types/api-types';

// Generate disease forecast
export const generateForecast = async (data: ForecastRequest): Promise<ApiResponse<ForecastResponse>> => {
  return await post<ForecastResponse>('/analytics/forecast', data);
};

// Process natural language analytics query
export const processQuery = async (data: DiseaseQuery): Promise<ApiResponse<QueryResult>> => {
  return await post<QueryResult>('/analytics/query', data);
};

// Analyze correlation between factors
export const analyzeCorrelation = async (data: CorrelationRequest): Promise<ApiResponse<CorrelationResult>> => {
  return await post<CorrelationResult>('/analytics/correlation', data);
};

// AI-powered disease data query
export const aiQuery = async (question: string): Promise<ApiResponse<{ answer: string }>> => {
  return await post<{ answer: string }>('/query', { question });
};
