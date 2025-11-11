"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IdeaCaptureForm, type IdeaCaptureData } from "@/components/IdeaCaptureForm";
import { Mic, ArrowRight, Lightbulb, Loader2 } from "lucide-react";
import type { IdeaType } from "@/components/IdeaCaptureForm";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

// Type for idea list items from API
interface IdeaListItem {
  id: string;
  title: string;
  idea_type: IdeaType;
  created_at: string;
  audio_transcript?: string;
}

export default function Home() {
  const { session } = useAuth();
  const toast = useToast();
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const [recentIdeas, setRecentIdeas] = useState<IdeaListItem[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent ideas on mount and when new idea is saved
  useEffect(() => {
    const fetchRecentIdeas = async () => {
      if (!session?.access_token) {
        setIsLoadingIdeas(false);
        return;
      }

      try {
        setIsLoadingIdeas(true);
        setError(null);

        const response = await fetch("/api/ideas?limit=3", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ideas");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setRecentIdeas(result.data);
        }
      } catch (err) {
        console.error("Error fetching ideas:", err);
        const errorMessage = "Failed to load recent ideas";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingIdeas(false);
      }
    };

    fetchRecentIdeas();
  }, [session?.access_token, toast]);

  const handleIdeaSubmit = async (data: IdeaCaptureData) => {
    if (!session?.access_token) {
      setError("You must be logged in to save ideas");
      return;
    }

    try {
      setError(null);

      // Prepare the payload for the API
      const payload = {
        title: data.title,
        idea_type: data.type,
        description: data.description,
        audio_transcript: data.audioBase64,
      };

      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save idea");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Add new idea to the top of the list
        setRecentIdeas((prev) => [result.data, ...prev.slice(0, 2)]);
        setShowCaptureForm(false);
        toast.success("Idea saved successfully!");
      }
    } catch (err) {
      console.error("Error saving idea:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save idea";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw so IdeaCaptureForm can handle it
    }
  };

  const handleCaptureCancel = () => {
    setShowCaptureForm(false);
    setError(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Capture Every Idea
          </h1>
          <p className="text-xl text-white/70 max-w-md mx-auto">
            Never lose a brilliant thought again. Speak it, capture it, refine it.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl p-4 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Main Content */}
        {!showCaptureForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
          >
            {/* Quick Capture Button */}
            <div className="flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowCaptureForm(true)}
                className="w-full max-w-md h-20 text-xl shadow-2xl shadow-primary/30"
              >
                <Mic size={28} className="mr-3" />
                Start Recording
              </Button>
            </div>

            {/* Recent Ideas */}
            {isLoadingIdeas ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : recentIdeas.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">
                    Recent Ideas
                  </h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // TODO: Navigate to ideas page
                      window.location.href = "/ideas";
                    }}
                  >
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        hover
                        className="cursor-pointer h-full"
                        onClick={() => {
                          // TODO: Navigate to idea detail
                          console.log("View idea:", idea.id);
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white line-clamp-2 flex-1">
                              {idea.title}
                            </h3>
                            <Badge
                              variant={
                                idea.idea_type === "tech"
                                  ? "default"
                                  : idea.idea_type === "business"
                                  ? "success"
                                  : idea.idea_type === "product"
                                  ? "warning"
                                  : "accent"
                              }
                            >
                              {idea.idea_type}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-end text-sm text-white/60">
                            <span>{formatTimeAgo(idea.created_at)}</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Empty State for No Ideas */}
            {!isLoadingIdeas && recentIdeas.length === 0 && (
              <Card className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Lightbulb size={40} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No ideas yet
                    </h3>
                    <p className="text-white/60 max-w-sm mx-auto">
                      Start capturing your brilliant thoughts by recording your first idea
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <IdeaCaptureForm
              onSubmit={handleIdeaSubmit}
              onCancel={handleCaptureCancel}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
