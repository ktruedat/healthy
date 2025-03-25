import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToService?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { showToast = true, logToService = false } = options;
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: unknown, message?: string) => {
    // Convert to Error object if it's not already
    const errorObj = error instanceof Error ? error : new Error(message || String(error));
    
    // Set the error state
    setError(errorObj);
    
    // Display toast notification if enabled
    if (showToast) {
      toast({
        variant: "destructive",
        title: "Error",
        description: errorObj.message || "An unexpected error occurred",
      });
    }
    
    // Log to console in non-production environments
    if (process.env.NODE_ENV !== "production") {
      console.error(errorObj);
    }
    
    // Log to error tracking service if enabled
    if (logToService) {
      // This would integrate with services like Sentry, LogRocket, etc.
      // Example: Sentry.captureException(errorObj);
    }
    
    return errorObj;
  }, [showToast, logToService]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return { error, handleError, clearError };
}

// Helper function to extract meaningful messages from different error types
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "Unknown error occurred";
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (
    typeof error === "object" && 
    error !== null && 
    "message" in error && 
    typeof error.message === "string"
  ) {
    return error.message;
  }
  
  return "An unexpected error occurred";
}
