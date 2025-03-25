import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Error types for classification
export enum ApiErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  UNAUTHORIZED = 'unauthorized', 
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Enhanced error class
export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  data?: any;
  
  constructor(message: string, type: ApiErrorType, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
  }
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Helper to classify errors
const classifyError = (error: AxiosError): ApiError => {
  if (error.code === 'ECONNABORTED') {
    return new ApiError('Request timeout', ApiErrorType.TIMEOUT);
  }
  
  if (!error.response) {
    return new ApiError('Network error', ApiErrorType.NETWORK);
  }
  
  const { status, data } = error.response;
  let message = error.message;
  let type = ApiErrorType.UNKNOWN;
  
  // Try to extract more helpful error message from response
  if (data && typeof data === 'object') {
    if ('message' in data && typeof data.message === 'string') {
      message = data.message;
    } else if ('error' in data && typeof data.error === 'string') {
      message = data.error;
    }
  }
  
  // Classify by status code
  switch (status) {
    case 400:
      type = ApiErrorType.VALIDATION;
      break;
    case 401:
      type = ApiErrorType.UNAUTHORIZED;
      break;
    case 403:
      type = ApiErrorType.FORBIDDEN;
      break;
    case 404:
      type = ApiErrorType.NOT_FOUND;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      type = ApiErrorType.SERVER;
      break;
    default:
      type = ApiErrorType.UNKNOWN;
  }
  
  return new ApiError(message, type, status, data);
};

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(classifyError(error));
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError = classifyError(error);
    
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`API Error (${apiError.type}):`, apiError.message, error);
    }
    
    // Could add additional handling here, like auto-logout on 401
    if (apiError.type === ApiErrorType.UNAUTHORIZED) {
      // For future auth: store.dispatch(logout());
    }
    
    return Promise.reject(apiError);
  }
);

// Type for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// Type for paginated responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Generic get method with error handling
export const get = async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<T>(url, { params });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    // Just rethrow ApiError from interceptor
    throw error;
  }
};

// Generic post method with error handling
export const post = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    // Just rethrow ApiError from interceptor
    throw error;
  }
};

// Generic patch method with error handling
export const patch = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.patch<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    // Just rethrow ApiError from interceptor
    throw error;
  }
};

// Generic delete method with error handling
export const del = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    // Just rethrow ApiError from interceptor
    throw error;
  }
};

export default apiClient;