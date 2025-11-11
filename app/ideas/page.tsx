"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import type { Idea, IdeaType, IdeaStatus } from "@/lib/types";
import {
  Search,
  Filter,
  Lightbulb,
  Clock,
  ChevronDown,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Type filter options
const TYPE_FILTERS: { value: IdeaType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tech", label: "Tech" },
  { value: "business", label: "Business" },
  { value: "product", label: "Product" },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
];

// Status filter options
const STATUS_FILTERS: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "captured", label: "Captured" },
  { value: "refining", label: "Refining" },
  { value: "validated", label: "Validated" },
  { value: "pursuing", label: "Pursuing" },
  { value: "archived", label: "Archived" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A-Z" },
];

// Items per page
const PAGE_SIZE = 20;

export default function IdeasPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<IdeaType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Pagination
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch ideas from API
  const fetchIdeas = useCallback(
    async (offset: number = 0, append: boolean = false) => {
      if (!session?.access_token) return;

      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        // Build URL with query parameters
        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          offset: offset.toString(),
        });

        if (typeFilter !== "all") {
          params.append("type", typeFilter);
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const response = await fetch(`/api/ideas?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ideas");
        }

        const result = await response.json();

        if (result.success && result.data) {
          if (append) {
            setIdeas((prev) => [...prev, ...result.data]);
          } else {
            setIdeas(result.data);
          }

          setTotal(result.meta?.pagination?.total || 0);
          setHasMore(result.meta?.pagination?.hasMore || false);
        } else {
          throw new Error(result.error || "Failed to fetch ideas");
        }
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError(err instanceof Error ? err.message : "Failed to load ideas");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [session?.access_token, typeFilter, statusFilter]
  );

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    if (!authLoading && session) {
      fetchIdeas(0, false);
    }
  }, [authLoading, session, typeFilter, statusFilter, fetchIdeas]);

  // Filter and sort ideas locally
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = [...ideas];

    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [ideas, debouncedSearch, sortBy]);

  // Handle load more
  const handleLoadMore = () => {
    fetchIdeas(ideas.length, true);
  };

  // Get badge variant for idea type
  const getTypeBadgeVariant = (type: IdeaType) => {
    switch (type) {
      case "tech":
        return "default";
      case "business":
        return "success";
      case "product":
        return "warning";
      case "content":
        return "accent";
      default:
        return "default";
    }
  };

  // Get badge variant for status
  const getStatusBadgeVariant = (status: IdeaStatus) => {
    switch (status) {
      case "captured":
        return "default";
      case "refining":
        return "warning";
      case "validated":
        return "accent";
      case "pursuing":
        return "success";
      case "archived":
        return "danger";
      default:
        return "default";
    }
  };

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  // Truncate description
  const truncateDescription = (text: string | undefined, maxLength: number = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Show loading skeleton
  if (authLoading || (loading && ideas.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-12 w-64 bg-white/10 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-96 bg-white/10 rounded-lg animate-pulse" />
          </div>

          <div className="space-y-6">
            {/* Search and filters skeleton */}
            <div className="h-14 bg-white/10 rounded-xl animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-white/10 rounded-full animate-pulse"
                />
              ))}
            </div>

            {/* Ideas grid skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-white/10 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
                <AlertCircle size={40} className="text-danger" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Failed to load ideas</h3>
                <p className="text-white/60 max-w-sm mx-auto mb-4">{error}</p>
                <Button onClick={() => fetchIdeas(0, false)}>Try Again</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Empty state - no ideas at all
  if (ideas.length === 0 && !debouncedSearch && typeFilter === "all" && statusFilter === "all") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center py-16">
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Lightbulb size={48} className="text-primary" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold mb-3">No ideas yet</h2>
                  <p className="text-white/60 max-w-md mx-auto text-lg mb-6">
                    Start capturing your brilliant thoughts! Head to the home page to record
                    your first idea.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push("/")}
                  >
                    <Sparkles size={20} className="mr-2" />
                    Capture Your First Idea
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // No results for current filters/search
  const showingIdeas = filteredAndSortedIdeas.length;
  const noResults = showingIdeas === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Your Ideas</h1>
          <p className="text-white/60 text-lg">
            {total > 0
              ? `${total} ${total === 1 ? "idea" : "ideas"} captured`
              : "Browse, filter, and manage your ideas"}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              size={20}
            />
            <input
              type="text"
              placeholder="Search ideas by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Type Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-white/60" />
              <span className="text-sm font-medium text-white/60">Type</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTypeFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                    typeFilter === filter.value
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "glass text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-white/60" />
              <span className="text-sm font-medium text-white/60">Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                    statusFilter === filter.value
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "glass text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">
              Showing {showingIdeas} of {total} {total === 1 ? "idea" : "ideas"}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="glass rounded-xl pl-4 pr-10 py-2 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                size={16}
              />
            </div>
          </div>
        </motion.div>

        {/* No Results */}
        {noResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center">
                  <Search size={40} className="text-warning" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No ideas found</h3>
                  <p className="text-white/60 max-w-sm mx-auto mb-4">
                    {debouncedSearch
                      ? `No ideas match "${debouncedSearch}". Try a different search term.`
                      : "No ideas match your current filters. Try adjusting your filters."}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Ideas Grid */}
        {!noResults && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8"
            >
              <AnimatePresence>
                {filteredAndSortedIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      hover
                      className="cursor-pointer h-full flex flex-col"
                      onClick={() => router.push(`/ideas/${idea.id}`)}
                    >
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-white line-clamp-2 flex-1">
                            {idea.title}
                          </h3>
                          <Badge variant={getTypeBadgeVariant(idea.idea_type)}>
                            {idea.idea_type}
                          </Badge>
                        </div>

                        {/* Description */}
                        {idea.description && (
                          <p className="text-white/60 text-sm line-clamp-3">
                            {truncateDescription(idea.description)}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <Badge variant={getStatusBadgeVariant(idea.status)}>
                            {idea.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-white/50">
                            <Clock size={12} />
                            <span>{formatTimeAgo(idea.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {hasMore && !debouncedSearch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  loading={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
