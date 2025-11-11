"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Sparkles } from "lucide-react";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  onButtonClick?: () => void;
  highlighted?: boolean;
  loading?: boolean;
  disabled?: boolean;
  currentPlan?: boolean;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  onButtonClick,
  highlighted = false,
  loading = false,
  disabled = false,
  currentPlan = false,
}: PricingCardProps) {
  return (
    <Card
      className={`relative ${
        highlighted
          ? "border-2 border-primary shadow-xl shadow-primary/20 scale-105"
          : "border border-white/20"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-primary-dark rounded-full">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <Sparkles size={16} />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-white/70 text-sm">{description}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold gradient-text">{price}</span>
          {period && <span className="text-white/60">/{period}</span>}
        </div>

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                !feature.included ? "opacity-40" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  feature.included
                    ? "bg-primary/20 text-primary"
                    : "bg-white/10 text-white/40"
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </div>
              <span
                className={`text-sm ${
                  feature.included ? "text-white/90" : "text-white/40 line-through"
                }`}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          variant={highlighted ? "primary" : currentPlan ? "secondary" : "outline"}
          className="w-full"
          onClick={onButtonClick}
          loading={loading}
          disabled={disabled || currentPlan || loading}
        >
          {currentPlan ? "Current Plan" : buttonText}
        </Button>
      </div>
    </Card>
  );
}
