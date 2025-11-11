"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Lightbulb, Briefcase, Package, FileText, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { convertBlobToBase64 } from "@/lib/audio-utils";

export type IdeaType = "tech" | "business" | "product" | "content" | "other";

export interface IdeaCaptureData {
  title: string;
  type: IdeaType;
  description?: string;
  audioBlob?: Blob;
  audioBase64?: string;
  duration?: number;
}

export interface IdeaCaptureFormProps {
  onSubmit: (data: IdeaCaptureData) => void | Promise<void>;
  onCancel?: () => void;
}

const ideaTypes: {
  value: IdeaType;
  label: string;
  icon: React.ElementType;
  color: "default" | "success" | "warning" | "danger" | "accent";
}[] = [
  { value: "tech", label: "Tech", icon: Lightbulb, color: "default" },
  { value: "business", label: "Business", icon: Briefcase, color: "success" },
  { value: "product", label: "Product", icon: Package, color: "warning" },
  { value: "content", label: "Content", icon: FileText, color: "accent" },
  { value: "other", label: "Other", icon: Sparkles, color: "danger" },
];

export function IdeaCaptureForm({ onSubmit, onCancel }: IdeaCaptureFormProps) {
  const [step, setStep] = useState<"record" | "details">("record");
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<IdeaType>("tech");
  const [description, setDescription] = useState("");
  const [audioData, setAudioData] = useState<{
    blob: Blob;
    duration: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioData({ blob, duration });
    setStep("details");
  };

  const handleRecordingCancel = () => {
    setAudioData(null);
    onCancel?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a title for your idea");
      return;
    }

    if (!audioData) {
      setError("Please record audio for your idea");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert audio blob to base64 for storage
      const audioBase64 = await convertBlobToBase64(audioData.blob);

      const data: IdeaCaptureData = {
        title: title.trim(),
        type: selectedType,
        description: description.trim() || undefined,
        audioBlob: audioData.blob,
        audioBase64,
        duration: audioData.duration,
      };

      await onSubmit(data);

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedType("tech");
      setAudioData(null);
      setStep("record");
    } catch (err) {
      setError("Failed to save idea. Please try again.");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep("record");
    setAudioData(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <AnimatePresence mode="wait">
        {step === "record" ? (
          <motion.div
            key="record"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold gradient-text mb-2">
                Record Your Idea
              </h2>
              <p className="text-white/60">
                Speak freely - capture your thoughts as they come
              </p>
            </div>

            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={handleRecordingCancel}
              maxDuration={300}
            />
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/20 mb-4">
                <Check size={24} className="text-success" />
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">
                Add Details
              </h2>
              <p className="text-white/60">
                Give your idea a title and categorize it
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title Input */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-white/80">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AI-powered productivity tool"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl glass border border-white/20",
                    "text-white placeholder:text-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "transition-all duration-200"
                  )}
                  maxLength={100}
                  autoFocus
                />
                <div className="text-xs text-white/40 text-right">
                  {title.length}/100
                </div>
              </div>

              {/* Idea Type Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/80">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {ideaTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.value;

                    return (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/20 shadow-lg shadow-primary/30"
                            : "border-white/20 glass hover:border-white/40"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon
                          size={24}
                          className={isSelected ? "text-primary" : "text-white/60"}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-white/60"
                          )}
                        >
                          {type.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-white/80">
                  Additional Notes <span className="text-white/40">(optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional context or details..."
                  rows={4}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl glass border border-white/20",
                    "text-white placeholder:text-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "transition-all duration-200 resize-none"
                  )}
                  maxLength={500}
                />
                <div className="text-xs text-white/40 text-right">
                  {description.length}/500
                </div>
              </div>

              {/* Audio Info */}
              {audioData && (
                <div className="p-4 rounded-xl glass border border-success/30 bg-success/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check size={20} className="text-success" />
                      <span className="text-sm text-white/80">
                        Audio recorded
                      </span>
                    </div>
                    <Badge variant="success">
                      {Math.floor(audioData.duration / 60)}:
                      {String(Math.floor(audioData.duration % 60)).padStart(2, "0")}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1"
                >
                  Save Idea
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
