"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as UIToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { ToastProvider as ContextProvider, useToast } from "@/components/ui/use-toast";

export function ToastProvider() {
  return (
    <ContextProvider>
      <ToastList />
    </ContextProvider>
  );
}

// Separate component to consume the toast context
function ToastList() {
  const { toasts } = useToast();

  return (
    <UIToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </UIToastProvider>
  );
}
