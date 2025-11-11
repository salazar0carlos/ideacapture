"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [queue, setQueue] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const dismissToast = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setToasts((prev) => {
      const updated = prev.filter((toast) => toast.id !== id);

      // If there's space and items in queue, move from queue to toasts
      if (updated.length < MAX_TOASTS) {
        setQueue((q) => {
          if (q.length > 0) {
            const [nextToast, ...rest] = q;
            // Schedule auto-dismiss for the dequeued toast
            const timeout = setTimeout(() => {
              dismissToast(nextToast.id);
            }, nextToast.duration);
            timeoutRefs.current.set(nextToast.id, timeout);

            return rest;
          }
          return q;
        });

        // Move first queued item to visible toasts
        setQueue((q) => {
          if (q.length > 0) {
            const [nextToast, ...rest] = q;
            setToasts((current) => [...current, nextToast]);
            return rest;
          }
          return q;
        });
      }

      return updated;
    });
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, duration: number = DEFAULT_DURATION) => {
      const id = generateId();
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => {
        if (prev.length < MAX_TOASTS) {
          // Add to visible toasts and schedule auto-dismiss
          const timeout = setTimeout(() => {
            dismissToast(id);
          }, duration);
          timeoutRefs.current.set(id, timeout);

          return [...prev, newToast];
        } else {
          // Add to queue
          setQueue((q) => [...q, newToast]);
          return prev;
        }
      });
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const promise = useCallback(
    async <T,>(
      promiseToResolve: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ): Promise<T> => {
      const loadingId = generateId();
      const loadingToast: Toast = {
        id: loadingId,
        message: messages.loading,
        type: "info",
        duration: Infinity,
      };

      // Show loading toast
      setToasts((prev) => {
        if (prev.length < MAX_TOASTS) {
          return [...prev, loadingToast];
        } else {
          setQueue((q) => [...q, loadingToast]);
          return prev;
        }
      });

      try {
        const result = await promiseToResolve;

        // Dismiss loading toast
        dismissToast(loadingId);

        // Show success toast
        const successMessage =
          typeof messages.success === "function"
            ? messages.success(result)
            : messages.success;
        showToast(successMessage, "success");

        return result;
      } catch (err) {
        // Dismiss loading toast
        dismissToast(loadingId);

        // Show error toast
        const errorMessage =
          typeof messages.error === "function"
            ? messages.error(err as Error)
            : messages.error;
        showToast(errorMessage, "error");

        throw err;
      }
    },
    [showToast, dismissToast]
  );

  const value: ToastContextValue = {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    info,
    warning,
    promise,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
