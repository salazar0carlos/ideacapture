"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Wrench,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ValidationResult } from "@/lib/types";

interface ValidationResultsProps {
  validation: ValidationResult;
  className?: string;
}

// Score color and label helpers
const getScoreColor = (score: number) => {
  if (score >= 71) return "success";
  if (score >= 41) return "warning";
  return "danger";
};

const getScoreLabel = (score: number) => {
  if (score >= 71) return "Good";
  if (score >= 41) return "Medium";
  return "Poor";
};

const getScoreColorClasses = (score: number) => {
  if (score >= 71)
    return {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      progress: "bg-success",
    };
  if (score >= 41)
    return {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      progress: "bg-warning",
    };
  return {
    bg: "bg-danger/10",
    border: "border-danger/30",
    text: "text-danger",
    progress: "bg-danger",
  };
};

// Circular progress component
const CircularProgress = ({ score, size = 120 }: { score: number; size?: number }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = getScoreColorClasses(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className={colors.text}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", colors.text)}>{score}</span>
        <span className="text-sm text-white/60">/ 100</span>
      </div>
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ score }: { score: number }) => {
  const colors = getScoreColorClasses(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn("text-2xl font-bold", colors.text)}>{score}/100</span>
        <Badge variant={getScoreColor(score) as any}>{getScoreLabel(score)}</Badge>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colors.progress)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Expandable section component
const ExpandableSection = ({
  title,
  icon: Icon,
  score,
  analysis,
  items,
  itemLabel,
}: {
  title: string;
  icon: any;
  score: number;
  analysis: string;
  items: string[];
  itemLabel: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getScoreColorClasses(score);

  return (
    <div className={cn("rounded-xl border", colors.bg, colors.border)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <Icon size={24} className={colors.text} />
          <div className="text-left">
            <h4 className="font-semibold text-white">{title}</h4>
            <Badge variant={getScoreColor(score) as any} className="mt-1">
              {getScoreLabel(score)} ({score}/100)
            </Badge>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-white/60" />
        ) : (
          <ChevronDown size={20} className="text-white/60" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-white/60">Analysis</h5>
                <p className="text-white/80 text-sm leading-relaxed">{analysis}</p>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-white/60">{itemLabel}</h5>
                  <ul className="space-y-1">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                        <span className={cn("mt-1", colors.text)}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function ValidationResults({ validation, className }: ValidationResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Validation Results
Overall Score: ${validation.overall_score}/100

Market Demand: ${validation.demand.score}/100
${validation.demand.analysis}
Signals: ${validation.demand.signals.join(", ")}

Competition: ${validation.competition.score}/100
${validation.competition.analysis}
Competitors: ${validation.competition.competitors.join(", ")}

Feasibility: ${validation.feasibility.score}/100
${validation.feasibility.analysis}
Challenges: ${validation.feasibility.challenges.join(", ")}

Recommendation: ${validation.recommendation.should_pursue ? "Pursue" : "Do not pursue"}
${validation.recommendation.reasoning}

Next Steps:
${validation.recommendation.next_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Overall Score */}
      <Card hover={false}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-2xl font-bold gradient-text">Validation Results</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </Button>
          </div>

          <CircularProgress score={validation.overall_score} />

          <div className="space-y-1">
            <p className="text-sm text-white/60">
              Analyzed on {formatDate(validation.generated_at)}
            </p>
          </div>
        </div>
      </Card>

      {/* Score Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Demand Score */}
        <Card hover={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className={getScoreColorClasses(validation.demand.score).text} />
              <h4 className="font-semibold text-white">Demand</h4>
            </div>
            <ProgressBar score={validation.demand.score} />
          </div>
        </Card>

        {/* Competition Score */}
        <Card hover={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={20} className={getScoreColorClasses(validation.competition.score).text} />
              <h4 className="font-semibold text-white">Competition</h4>
            </div>
            <ProgressBar score={validation.competition.score} />
          </div>
        </Card>

        {/* Feasibility Score */}
        <Card hover={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wrench size={20} className={getScoreColorClasses(validation.feasibility.score).text} />
              <h4 className="font-semibold text-white">Feasibility</h4>
            </div>
            <ProgressBar score={validation.feasibility.score} />
          </div>
        </Card>
      </div>

      {/* Detailed Analysis Sections */}
      <div className="space-y-3">
        <ExpandableSection
          title="Market Demand"
          icon={TrendingUp}
          score={validation.demand.score}
          analysis={validation.demand.analysis}
          items={validation.demand.signals}
          itemLabel="Demand Signals"
        />

        <ExpandableSection
          title="Competition Analysis"
          icon={Users}
          score={validation.competition.score}
          analysis={validation.competition.analysis}
          items={validation.competition.competitors}
          itemLabel="Key Competitors"
        />

        <ExpandableSection
          title="Feasibility Assessment"
          icon={Wrench}
          score={validation.feasibility.score}
          analysis={validation.feasibility.analysis}
          items={validation.feasibility.challenges}
          itemLabel="Key Challenges"
        />
      </div>

      {/* Recommendation */}
      <Card
        hover={false}
        className={cn(
          "border-2",
          validation.recommendation.should_pursue
            ? "bg-success/10 border-success/30"
            : "bg-danger/10 border-danger/30"
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {validation.recommendation.should_pursue ? (
              <CheckCircle size={32} className="text-success" />
            ) : (
              <XCircle size={32} className="text-danger" />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">
                {validation.recommendation.should_pursue
                  ? "Recommended to Pursue"
                  : "Not Recommended"}
              </h3>
              <Badge
                variant={validation.recommendation.should_pursue ? "success" : "danger"}
                className="mt-1"
              >
                {validation.recommendation.should_pursue ? "Green Light" : "Red Flag"}
              </Badge>
            </div>
          </div>

          <p className="text-white/80 leading-relaxed">
            {validation.recommendation.reasoning}
          </p>

          {validation.recommendation.next_steps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Target size={18} />
                Next Steps
              </h4>
              <ul className="space-y-2">
                {validation.recommendation.next_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                        validation.recommendation.should_pursue
                          ? "bg-success/20 text-success"
                          : "bg-danger/20 text-danger"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-white/80 pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
