import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";

// Generic error message with optional retry
export function ErrorMessage({
  title = "Something went wrong",
  description,
  error,
  onRetry,
}: {
  title?: string;
  description?: string;
  error?: Error;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        {description || (error && error.message) || "An unexpected error occurred."}
        {process.env.NODE_ENV !== "production" && error && (
          <details className="text-xs mt-2 cursor-pointer">
            <summary>Technical Details</summary>
            <pre className="mt-2 max-h-96 overflow-auto p-2 bg-destructive/10 rounded">
              {error.stack || error.message}
            </pre>
          </details>
        )}
        {onRetry && (
          <Button
            size="sm" 
            variant="outline"
            onClick={onRetry}
            className="w-fit mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Empty state when there's no error but no data
export function EmptyState({
  title = "No data found",
  description = "There are no items to display at this time.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="rounded-full bg-muted p-3">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Query error handler component
export function QueryErrorDisplay({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null;
  
  if (error instanceof Error) {
    // Handle standard errors
    return <ErrorMessage error={error} onRetry={onRetry} />;
  }
  
  // Handle unknown error types
  return <ErrorMessage title="Unexpected Error" description="An unknown error occurred" onRetry={onRetry} />;
}

// Network error specific display
export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Network Error"
      description="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
    />
  );
}

// API error message component
export function ApiErrorDisplay({ 
  status, 
  message, 
  onRetry 
}: { 
  status?: number; 
  message?: string;
  onRetry?: () => void;
}) {
  let title = "API Error";
  let description = message || "An error occurred while fetching data.";
  
  if (status === 401) {
    title = "Unauthorized";
    description = "You don't have permission to access this resource.";
  } else if (status === 403) {
    title = "Forbidden";
    description = "Access to this resource is forbidden.";
  } else if (status === 404) {
    title = "Not Found";
    description = "The requested resource was not found.";
  } else if (status === 500) {
    title = "Server Error";
    description = "The server encountered an error. Please try again later.";
  } else if (status === 503) {
    title = "Service Unavailable";
    description = "The service is currently unavailable. Please try again later.";
  }
  
  return <ErrorMessage title={title} description={description} onRetry={onRetry} />;
}
