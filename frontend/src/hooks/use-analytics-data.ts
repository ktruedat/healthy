import { useMutation, useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services";
import {
  ForecastRequest,
  ForecastResponse,
  CorrelationRequest,
  CorrelationResult,
  DiseaseQuery,
  QueryResult
} from "@/types/api-types";

// Generate disease forecast
export function useGenerateForecast() {
  return useMutation<ForecastResponse, Error, ForecastRequest>({
    mutationFn: async (data) => {
      const response = await analyticsService.generateForecast(data);
      return response.data;
    }
  });
}

// Process natural language analytics query
export function useProcessQuery() {
  return useMutation<QueryResult, Error, DiseaseQuery>({
    mutationFn: async (data) => {
      const response = await analyticsService.processQuery(data);
      return response.data;
    }
  });
}

// Analyze correlation between factors
export function useAnalyzeCorrelation() {
  return useMutation<CorrelationResult, Error, CorrelationRequest>({
    mutationFn: async (data) => {
      const response = await analyticsService.analyzeCorrelation(data);
      return response.data;
    }
  });
}

// AI-powered disease data query
export function useAIQuery(question: string | null) {
  return useQuery({
    queryKey: ['ai-query', question],
    queryFn: async () => {
      if (!question) return null;
      const response = await analyticsService.aiQuery(question);
      return response.data;
    },
    enabled: !!question, // Only run the query if we have a question
  });
}
