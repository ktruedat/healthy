// API Types based on OpenAPI specification

// Category type
export interface Category {
  id: number;
  name: string;
}

export interface CategoryInput {
  name: string;
}

// Disease type
export interface Disease {
  id: number;
  name: string;
  category_id?: number;
  description?: string;
  region?: string; // Make region optional
}

export interface DiseaseInput {
  name: string;
  category_id: number;
  description?: string;
}

// Disease data type
export interface DiseaseData {
  year: number;
  quarter: number;
  cases: number;
  prevalence?: number;
  incidence?: number;
}

export interface DiseaseDataInput {
  year: number;
  quarter: number;
  cases: number;
  notes?: string;
}

// Dashboard summary types
export interface DashboardSummary {
  totalCases: number;
  totalDeaths: number;
  totalRecoveries: number;
  totalDiseases?: number;
  totalRegions?: number;
  averageRate: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  topDiseases?: {
    diseaseId: number;
    name: string;
    cases: number;
  }[];
  recentTrends?: {
    diseaseId: number;
    name: string;
    trendPercentage: number;
    direction: 'up' | 'down' | 'stable';
  }[];
}

// Disease trends
export interface DiseaseTrends {
  points: {
    year: number;
    quarter: number;
    name: string;
    cases: number;
    incidenceRate: number;
    mortalityRate: number;
    recoveryRate: number;
  }[];
}

// Map data
export interface MapData {
  regions: {
    name: string;
    cases: number;
    lat: number;
    lon: number;
    diseases: string[];
  }[];
}

// Forecast types
export interface ForecastRequest {
  disease_id: number;
  year: number;
  quarters?: number[];
}

export interface ForecastResponse {
  disease_id: number;
  year: number;
  forecast: number[];
  confidence_intervals?: {
    lower: number;
    upper: number;
  }[];
}

// Correlation types
export interface CorrelationRequest {
  factor1: string;
  factor2: string;
  timeframe: {
    start_date: string;
    end_date: string;
  };
}

export interface CorrelationResult {
  correlation_coefficient: number;
  p_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  visualization_data: any;
}

// Query types
export interface DiseaseQuery {
  query: string;
  filters?: {
    start_date?: string;
    end_date?: string;
  };
}

export interface QueryResult {
  result_type: 'time_series' | 'comparison' | 'statistics' | 'correlation';
  data: any;
  explanation: string;
}

// Filter types for API requests
export interface DiseaseFilters {
  startYear?: number;
  endYear?: number;
  quarters?: number[];
  regions?: string[];
  categories?: string[];
  diseaseIds?: string[];
  minCases?: number;
  maxCases?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
