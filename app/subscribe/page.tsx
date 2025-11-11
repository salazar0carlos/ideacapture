"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/PricingCard";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { supabase } from "@/lib/supabase";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SubscribePage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);

  const handleSubscribe = async (billingPeriod: "monthly" | "yearly") => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      router.push("/login");
      return;
    }

    const setLoading = billingPeriod === "monthly" ? setLoadingMonthly : setLoadingYearly;
    setLoading(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          billing_period: billingPeriod,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = result.data.url;
      } else {
        toast.error(result.error || "Failed to create checkout session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout process");
      setLoading(false);
    }
  };

  const freePlanFeatures = [
    { text: "10 ideas maximum", included: true },
    { text: "2-minute voice recordings", included: true },
    { text: "3 refinement questions", included: true },
    { text: "Basic idea organization", included: true },
    { text: "AI validation", included: false },
    { text: "Unlimited ideas", included: false },
    { text: "5-minute recordings", included: false },
  ];

  const proPlanFeatures = [
    { text: "Unlimited ideas", included: true },
    { text: "5-minute voice recordings", included: true },
    { text: "5 refinement questions", included: true },
    { text: "Full AI validation", included: true },
    { text: "Advanced idea analytics", included: true },
    { text: "Priority support", included: true },
    { text: "Export to all formats", included: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Back button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <Sparkles size={20} className="text-primary" />
            <span className="text-sm font-semibold text-primary">
              Upgrade to Pro
            </span>
          </div>

          <h1 className="text-5xl font-bold gradient-text">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/70">
            Start capturing unlimited ideas with AI-powered validation and refinement
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <PricingCard
            title="Free"
            price="$0"
            period="forever"
            description="Perfect for getting started with idea management"
            features={freePlanFeatures}
            buttonText="Current Plan"
            currentPlan={true}
          />

          {/* Pro Monthly */}
          <PricingCard
            title="Pro Monthly"
            price="$4.99"
            period="month"
            description="Full access to all features with monthly billing"
            features={proPlanFeatures}
            buttonText="Subscribe Monthly"
            onButtonClick={() => handleSubscribe("monthly")}
            loading={loadingMonthly}
            disabled={loadingYearly}
          />

          {/* Pro Yearly */}
          <PricingCard
            title="Pro Yearly"
            price="$49.99"
            period="year"
            description="Save 17% with annual billing - best value!"
            features={proPlanFeatures}
            buttonText="Subscribe Yearly"
            onButtonClick={() => handleSubscribe("yearly")}
            highlighted={true}
            loading={loadingYearly}
            disabled={loadingMonthly}
          />
        </div>

        {/* Feature comparison */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Why Upgrade to Pro?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Unlimited Ideas
              </h3>
              <p className="text-white/70">
                Capture and organize as many ideas as you want without any restrictions.
                Never lose a brilliant thought again.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Validation
              </h3>
              <p className="text-white/70">
                Get comprehensive AI-powered validation with market demand analysis,
                competition assessment, and feasibility scoring.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Extended Recordings
              </h3>
              <p className="text-white/70">
                Record voice notes up to 5 minutes long. Capture complete thoughts
                and detailed explanations of your ideas.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Deep Refinement
              </h3>
              <p className="text-white/70">
                Answer 5 AI-generated questions to thoroughly develop and refine
                each idea into something actionable.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ or trust signals */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <p className="text-white/60 text-sm">
            Secure payment processing by Stripe. Cancel anytime. No long-term commitments.
          </p>
        </div>
      </div>
    </div>
  );
}
