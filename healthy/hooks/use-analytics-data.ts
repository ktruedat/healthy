'use client';

import { useMutation } from '@tanstack/react-query';
import { 
  generateForecast, 
  processQuery, 
  analyzeCorrelation,
  aiQuery
} from '@/lib/services/analytics-service';
import { 
  ForecastRequest, 
  CorrelationRequest,
  DiseaseQuery 
} from '@/lib/types/api-types';

// Hook for generating disease forecasts
export function useForecast() {
  return useMutation({
    mutationFn: (data: ForecastRequest) => generateForecast(data),
  });
}

// Hook for processing natural language analytics queries
export function useProcessQuery() {
  return useMutation({
    mutationFn: (data: DiseaseQuery) => processQuery(data),
  });
}

// Hook for analyzing correlations between factors
export function useCorrelation() {
  return useMutation({
    mutationFn: (data: CorrelationRequest) => analyzeCorrelation(data),
  });
}

// Hook for AI-powered disease data query
export function useAiQuery() {
  return useMutation({
    mutationFn: (question: string) => aiQuery(question),
  });
} 