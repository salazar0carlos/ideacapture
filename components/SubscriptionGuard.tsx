"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionGuardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  feature: "ideas" | "validation" | "refinement";
}

export function SubscriptionGuard({
  isOpen,
  onClose,
  title,
  message,
  feature,
}: SubscriptionGuardProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleUpgrade = () => {
    setIsClosing(true);
    setTimeout(() => {
      router.push("/subscribe");
      onClose();
    }, 200);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const proFeatures = [
    { icon: Zap, text: "Unlimited ideas", available: feature === "ideas" },
    { icon: Sparkles, text: "5-minute voice recordings", available: true },
    { icon: Check, text: "5 refinement questions", available: feature === "refinement" },
    { icon: Check, text: "Full AI validation", available: feature === "validation" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isClosing ? 0.9 : 1, opacity: isClosing ? 0 : 1 }}
            transition={{ duration: 0.2, type: "spring", damping: 20 }}
            className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="p-8 space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto">
                <Sparkles size={32} className="text-white" />
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-white/70 text-sm">{message}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 bg-black/30 rounded-lg p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Upgrade to Pro
                </p>
                {proFeatures.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 ${
                      item.available ? "text-white" : "text-white/60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.available
                          ? "bg-primary/20 text-primary"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Pricing info */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold gradient-text">$4.99</span>
                  <span className="text-white/60">/month</span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  or $49.99/year (save 17%)
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  <Sparkles size={20} className="mr-2" />
                  Upgrade to Pro
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
