"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/lib/toast-context";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Trash2,
  Sparkles,
  CheckCircle,
  Lightbulb,
  Briefcase,
  Package,
  FileText,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Idea, IdeaType, IdeaStatus } from "@/lib/types";
import { ValidationResults } from "@/components/ValidationResults";

const ideaTypeConfig = {
  tech: { icon: Lightbulb, color: "default" as const },
  business: { icon: Briefcase, color: "success" as const },
  product: { icon: Package, color: "warning" as const },
  content: { icon: FileText, color: "accent" as const },
  other: { icon: Sparkles, color: "danger" as const },
};

const statusConfig: Record<IdeaStatus, { label: string; color: "default" | "warning" | "success" | "accent" | "danger" }> = {
  captured: { label: "Captured", color: "default" },
  refining: { label: "Refining", color: "warning" },
  validated: { label: "Validated", color: "success" },
  pursuing: { label: "Pursuing", color: "accent" },
  archived: { label: "Archived", color: "danger" },
};

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<IdeaType>("tech");
  const [editStatus, setEditStatus] = useState<IdeaStatus>("captured");

  // Unwrap params
  useEffect(() => {
    params.then((p) => setIdeaId(p.id));
  }, [params]);

  // Fetch idea
  useEffect(() => {
    if (!ideaId) return;

    const fetchIdea = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ideas/${ideaId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch idea");
        }

        if (!data.data) {
          throw new Error("Idea not found");
        }

        setIdea(data.data);
        setEditTitle(data.data.title);
        setEditDescription(data.data.description || "");
        setEditType(data.data.idea_type);
        setEditStatus(data.data.status);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load idea";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [ideaId, toast]);

  const handleEdit = () => {
    if (idea) {
      setEditTitle(idea.title);
      setEditDescription(idea.description || "");
      setEditType(idea.idea_type);
      setEditStatus(idea.status);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!idea || !ideaId) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          idea_type: editType,
          status: editStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update idea");
      }

      setIdea(data.data);
      setIsEditing(false);
      toast.success("Idea updated successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save changes";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ideaId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete idea");
      }

      toast.success("Idea deleted successfully!");
      router.push("/ideas");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete idea";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleValidate = async () => {
    if (!ideaId) return;

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force_revalidation: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate idea");
      }

      // Refresh idea to get updated validation results
      const refreshResponse = await fetch(`/api/ideas/${ideaId}`);
      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok && refreshData.data) {
        setIdea(refreshData.data);
        toast.success("Idea validated successfully!");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to validate idea";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefine = () => {
    if (!ideaId) return;
    router.push(`/ideas/${ideaId}/refine`);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back button skeleton */}
          <div className="h-10 w-24 bg-white/10 rounded-xl animate-pulse" />

          {/* Card skeleton */}
          <Card hover={false}>
            <div className="space-y-6">
              <div className="h-8 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
              <div className="h-32 bg-white/10 rounded animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !idea) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="secondary"
            onClick={() => router.push("/ideas")}
            className="mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Ideas
          </Button>

          <Card>
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
                <X size={40} className="text-danger" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p className="text-white/60 mb-6">{error}</p>
              <Button variant="primary" onClick={() => router.push("/ideas")}>
                Return to Ideas
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!idea) return null;

  const TypeIcon = ideaTypeConfig[idea.idea_type]?.icon || Sparkles;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => router.push("/ideas")}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Ideas
        </Button>

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

        {/* Main Card */}
        <Card hover={false}>
          <div className="space-y-6">
            {/* Header with Title and Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl glass border border-white/20",
                      "text-2xl font-bold text-white placeholder:text-white/40",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                    placeholder="Idea title"
                    maxLength={100}
                  />
                ) : (
                  <h1 className="text-3xl font-bold gradient-text">{idea.title}</h1>
                )}
              </div>

              {!isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {/* Type and Status Badges */}
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <div className="flex flex-wrap gap-3">
                  {/* Type Selector */}
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as IdeaType)}
                    className={cn(
                      "px-4 py-2 rounded-xl glass border border-white/20",
                      "text-white bg-transparent",
                      "focus:outline-none focus:ring-2 focus:ring-primary"
                    )}
                  >
                    <option value="tech" className="bg-background-dark">Tech</option>
                    <option value="business" className="bg-background-dark">Business</option>
                    <option value="product" className="bg-background-dark">Product</option>
                    <option value="content" className="bg-background-dark">Content</option>
                    <option value="other" className="bg-background-dark">Other</option>
                  </select>

                  {/* Status Selector */}
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as IdeaStatus)}
                    className={cn(
                      "px-4 py-2 rounded-xl glass border border-white/20",
                      "text-white bg-transparent",
                      "focus:outline-none focus:ring-2 focus:ring-primary"
                    )}
                  >
                    <option value="captured" className="bg-background-dark">Captured</option>
                    <option value="refining" className="bg-background-dark">Refining</option>
                    <option value="validated" className="bg-background-dark">Validated</option>
                    <option value="pursuing" className="bg-background-dark">Pursuing</option>
                    <option value="archived" className="bg-background-dark">Archived</option>
                  </select>
                </div>
              ) : (
                <>
                  <Badge variant={ideaTypeConfig[idea.idea_type]?.color || "default"}>
                    <TypeIcon size={14} className="mr-1" />
                    {idea.idea_type}
                  </Badge>
                  <Badge variant={statusConfig[idea.status]?.color || "default"}>
                    {statusConfig[idea.status]?.label || idea.status}
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/60">Description</h3>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl glass border border-white/20",
                    "text-white placeholder:text-white/40 min-h-[120px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "resize-none"
                  )}
                  placeholder="Add a description..."
                  maxLength={500}
                />
              ) : (
                <p className="text-white/80">
                  {idea.description || <span className="text-white/40 italic">No description</span>}
                </p>
              )}
            </div>

            {/* Audio Transcript */}
            {idea.audio_transcript && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/60">Audio Recording</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={16} className="mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 rounded-xl glass border border-primary/30 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Volume2 size={20} className="text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-white/80 italic">
                        {idea.audio_transcript}
                      </p>
                      <p className="text-xs text-white/40">
                        Audio file stored securely
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Refinement Q&A */}
            {idea.refinement_questions && Array.isArray(idea.refinement_questions) && idea.refinement_questions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/60">Refinement</h3>
                <div className="space-y-3">
                  {idea.refinement_questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl glass border border-white/20">
                      <p className="text-sm font-medium text-white/80 mb-2">{q.question}</p>
                      {idea.refinement_answers?.[q.id] && (
                        <p className="text-sm text-white/60">
                          {idea.refinement_answers[q.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Results */}
            {idea.validation_result && (
              <ValidationResults validation={idea.validation_result} />
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Created:</span>{" "}
                  <span className="text-white/80">{formatDate(idea.created_at)}</span>
                </div>
                <div>
                  <span className="text-white/40">Updated:</span>{" "}
                  <span className="text-white/80">{formatDate(idea.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Edit Mode Actions */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <X size={20} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving || !editTitle.trim()}
                  className="flex-1"
                >
                  <Save size={20} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            )}

            {/* Action Buttons (when not editing) */}
            {!isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="primary"
                  onClick={handleRefine}
                  className="flex-1"
                >
                  <Sparkles size={20} className="mr-2" />
                  Refine Idea
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleValidate}
                  loading={isValidating}
                  disabled={isValidating}
                  className="flex-1"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Validate Idea
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-danger text-danger hover:bg-danger/10"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <Card hover={false} className="max-w-md w-full">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                        <Trash2 size={24} className="text-danger" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Delete Idea?</h3>
                        <p className="text-sm text-white/60">This action cannot be undone</p>
                      </div>
                    </div>

                    <p className="text-white/80">
                      Are you sure you want to delete &quot;{idea.title}&quot;? All associated data will be permanently removed.
                    </p>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleDelete}
                        loading={isDeleting}
                        disabled={isDeleting}
                        className="flex-1 bg-danger hover:bg-danger/90"
                      >
                        <Trash2 size={20} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
