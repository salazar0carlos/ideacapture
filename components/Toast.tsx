"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast, type Toast as ToastType } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-success/20",
    borderColor: "border-success/40",
    textColor: "text-success",
    progressColor: "bg-success",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-danger/20",
    borderColor: "border-danger/40",
    textColor: "text-danger",
    progressColor: "bg-danger",
  },
  info: {
    icon: Info,
    bgColor: "bg-primary/20",
    borderColor: "border-primary/40",
    textColor: "text-primary",
    progressColor: "bg-primary",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-warning/20",
    borderColor: "border-warning/40",
    textColor: "text-warning",
    progressColor: "bg-warning",
  },
};

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration === Infinity) {
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-xl border backdrop-blur-xl",
        "shadow-2xl shadow-black/20",
        "min-w-[280px] max-w-[400px] w-full",
        "glass",
        config.bgColor,
        config.borderColor
      )}
      onClick={() => onDismiss(toast.id)}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("flex-shrink-0 mt-0.5", config.textColor)}>
            <Icon size={20} className="stroke-[2.5]" />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            className={cn(
              "flex-shrink-0 p-1 rounded-lg transition-colors",
              "hover:bg-white/10 active:bg-white/20",
              "text-white/60 hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-white/30"
            )}
            aria-label="Dismiss notification"
          >
            <X size={16} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Progress Bar */}
        {toast.duration !== Infinity && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className={cn("h-full", config.progressColor)}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.016, ease: "linear" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className={cn(
        "fixed z-[9999] pointer-events-none",
        // Desktop: top-right
        "top-6 right-6",
        // Mobile: top-center
        "md:top-6 md:right-6",
        "max-md:top-4 max-md:left-1/2 max-md:-translate-x-1/2",
        "flex flex-col gap-3",
        "max-md:items-center max-md:w-[calc(100vw-2rem)]"
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
