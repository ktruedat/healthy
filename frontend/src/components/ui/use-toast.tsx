// Inspired by react-hot-toast library
"use client";

import * as React from "react";

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

interface ToastContextType {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => string;
  dismiss: (toastId?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

// Create a toast provider component
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  // Move addToRemoveQueue inside the component where it has access to dispatch
  const addToRemoveQueue = React.useCallback((toastId: string) => {
    if (toastTimeouts.has(toastId)) {
      return;
    }

    const timeout = setTimeout(() => {
      toastTimeouts.delete(toastId);
      dispatch({
        type: actionTypes.REMOVE_TOAST,
        toastId,
      });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
  }, []);

  // Toast function definition is now inside the component
  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = genId();

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss(id);
        },
      },
    });

    return id;
  }, []);

  // Dismiss function definition is now inside the component
  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      addToRemoveQueue(toastId);
    } else {
      state.toasts.forEach((toast) => {
        addToRemoveQueue(toast.id);
      });
    }
    
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
  }, [addToRemoveQueue, state.toasts]);

  // Provide these functions through context
  const contextValue = React.useMemo(
    () => ({ toasts: state.toasts, toast, dismiss }),
    [state.toasts, toast, dismiss]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// Create standalone functions that use the hook internally
export function toast(props: Omit<ToasterToast, "id">) {
  return useToast().toast(props);
}

export function dismiss(toastId?: string) {
  return useToast().dismiss(toastId);
}

export { ToastProvider };
