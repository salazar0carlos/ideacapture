"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex-1">
        {label && (
          <label className="text-base font-medium text-white">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-white/60 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          enabled ? "bg-primary" : "bg-white/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <motion.span
          aria-hidden="true"
          animate={{
            x: enabled ? 20 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out",
            enabled ? "bg-white" : "bg-white/80"
          )}
        />
      </button>
    </div>
  );
}
