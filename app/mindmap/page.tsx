"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import type { Idea, IdeaType } from "@/lib/types";
import {
  Lightbulb,
  Loader2,
  AlertCircle,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Filter,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MindMapNode, { MindMapNodeData } from "@/components/MindMapNode";

// Custom node types
const nodeTypes = {
  mindMapNode: MindMapNode,
};

// Type colors for legend and edges
const TYPE_COLORS: Record<IdeaType | "center", string> = {
  tech: "#6366F1",
  business: "#10B981",
  product: "#F59E0B",
  content: "#06B6D4",
  other: "#8B5CF6",
  center: "#8B5CF6",
};

// Type filters
const TYPE_FILTERS: { value: IdeaType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "tech", label: "Tech" },
  { value: "business", label: "Business" },
  { value: "product", label: "Product" },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
];

export default function MindMapPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<IdeaType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch ideas from API
  const fetchIdeas = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/ideas?limit=1000", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ideas");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setIdeas(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch ideas");
      }
    } catch (err) {
      console.error("Error fetching ideas:", err);
      setError(err instanceof Error ? err.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  // Fetch ideas on mount
  useEffect(() => {
    if (!authLoading && session) {
      fetchIdeas();
    }
  }, [authLoading, session, fetchIdeas]);

  // Filter ideas based on search and type
  const filteredIdeas = useMemo(() => {
    let filtered = [...ideas];

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((idea) => idea.idea_type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [ideas, typeFilter, searchQuery]);

  // Calculate circular layout positions
  const calculateLayout = useCallback((ideas: Idea[]) => {
    // Group ideas by type
    const groupedByType: Record<string, Idea[]> = {};
    ideas.forEach((idea) => {
      if (!groupedByType[idea.idea_type]) {
        groupedByType[idea.idea_type] = [];
      }
      groupedByType[idea.idea_type].push(idea);
    });

    const nodes: Node<MindMapNodeData>[] = [];
    const edges: Edge[] = [];

    // Center node
    const centerNode: Node<MindMapNodeData> = {
      id: "center",
      type: "mindMapNode",
      position: { x: 0, y: 0 },
      data: {
        id: "center",
        label: "My Ideas",
        type: "center",
        isCenter: true,
      },
    };
    nodes.push(centerNode);

    // Calculate positions for each type group
    const types = Object.keys(groupedByType);
    const baseRadius = 300;
    const anglePerType = (2 * Math.PI) / Math.max(types.length, 1);

    types.forEach((type, typeIndex) => {
      const typeIdeas = groupedByType[type];
      const typeAngle = anglePerType * typeIndex;

      // For each idea in this type
      const anglePerIdea = (Math.PI / 3) / Math.max(typeIdeas.length, 1);
      const startAngle = typeAngle - (Math.PI / 6);

      typeIdeas.forEach((idea, ideaIndex) => {
        const angle = startAngle + anglePerIdea * ideaIndex;
        const radius = baseRadius + (typeIdeas.length > 5 ? 50 : 0);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Create node
        const node: Node<MindMapNodeData> = {
          id: idea.id,
          type: "mindMapNode",
          position: { x, y },
          data: {
            id: idea.id,
            label: idea.title,
            type: idea.idea_type,
            status: idea.status,
            isCenter: false,
          },
        };
        nodes.push(node);

        // Create edge from center to this node
        const edge: Edge = {
          id: `e-center-${idea.id}`,
          source: "center",
          target: idea.id,
          type: "smoothstep",
          animated: false,
          style: {
            stroke: TYPE_COLORS[idea.idea_type],
            strokeWidth: 2,
            opacity: 0.6,
          },
        };
        edges.push(edge);
      });
    });

    return { nodes, edges };
  }, []);

  // Update nodes and edges when ideas change
  useEffect(() => {
    if (filteredIdeas.length > 0) {
      const { nodes: newNodes, edges: newEdges } = calculateLayout(filteredIdeas);
      setNodes(newNodes);
      setEdges(newEdges);

      // Fit view after a short delay to ensure layout is ready
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }
      }, 100);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [filteredIdeas, calculateLayout, setNodes, setEdges, reactFlowInstance]);

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id !== "center") {
        router.push(`/ideas/${node.id}`);
      }
    },
    [router]
  );

  // Handle fit view
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
  }, [reactFlowInstance]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 300 });
    }
  }, [reactFlowInstance]);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 300 });
    }
  }, [reactFlowInstance]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
  }, []);

  // Show loading skeleton
  if (authLoading || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-primary animate-spin" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Loading Mind Map</h3>
              <p className="text-white/60">Gathering your ideas...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
              <AlertCircle size={40} className="text-danger" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Failed to load</h3>
              <p className="text-white/60 mb-4">{error}</p>
              <Button onClick={fetchIdeas}>Try Again</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Empty state - no ideas
  if (ideas.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-4"
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
                  Create your first idea to see it visualized in your mind map!
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
    );
  }

  // No results after filtering
  const showingEmpty = filteredIdeas.length === 0 && (searchQuery || typeFilter !== "all");

  return (
    <div className="h-screen w-full relative">
      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
        className="bg-gradient-to-br from-background via-background to-primary/5"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255, 255, 255, 0.1)"
        />

        <MiniMap
          className="!bg-black/40 !border-2 !border-white/20 backdrop-blur-lg"
          nodeColor={(node) => {
            const data = node.data as MindMapNodeData;
            return TYPE_COLORS[data.type] || "#8B5CF6";
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />

        <Controls
          className="!bg-black/40 !border-2 !border-white/20 backdrop-blur-lg !shadow-xl"
          showInteractive={false}
        />

        {/* Top Panel - Search and Filters */}
        <Panel position="top-left" className="m-4 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Title */}
            <div className="glass rounded-xl px-4 py-3 shadow-xl">
              <h1 className="text-xl font-bold text-white">Mind Map</h1>
              <p className="text-xs text-white/60">
                {filteredIdeas.length} {filteredIdeas.length === 1 ? "idea" : "ideas"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="glass rounded-xl px-4 py-3 shadow-xl">
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-white/10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full glass rounded-xl px-4 py-3 shadow-xl flex items-center justify-between hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-white/60" />
                <span className="text-sm font-medium text-white">Filters</span>
              </div>
              <Badge variant="default" className="text-xs">
                {typeFilter === "all" ? "All" : typeFilter}
              </Badge>
            </button>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass rounded-xl px-4 py-3 shadow-xl space-y-2"
                >
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setTypeFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          typeFilter === filter.value
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  {(typeFilter !== "all" || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/20 text-danger hover:bg-danger/30 transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Panel>

        {/* Bottom Right Panel - Custom Controls */}
        <Panel position="bottom-right" className="m-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-2 shadow-xl flex flex-col gap-2"
          >
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              title="Zoom In"
            >
              <ZoomIn size={20} className="text-white" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={20} className="text-white" />
            </button>
            <button
              onClick={handleFitView}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              title="Fit View"
            >
              <Maximize2 size={20} className="text-white" />
            </button>
          </motion.div>
        </Panel>

        {/* Legend Panel */}
        <Panel position="bottom-left" className="m-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl px-4 py-3 shadow-xl"
          >
            <h3 className="text-xs font-semibold text-white/60 mb-2">Types</h3>
            <div className="space-y-1.5">
              {Object.entries(TYPE_COLORS)
                .filter(([key]) => key !== "center")
                .map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-white capitalize">{type}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </Panel>

        {/* Empty Filter Results */}
        {showingEmpty && (
          <Panel position="top-center" className="m-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center py-8 px-6 max-w-sm">
                <div className="flex flex-col items-center gap-3">
                  <Search size={32} className="text-warning" />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">No matches found</h3>
                    <p className="text-sm text-white/60 mb-3">
                      Try adjusting your search or filters
                    </p>
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
