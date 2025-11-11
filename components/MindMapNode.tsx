"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/Badge";
import type { IdeaType, IdeaStatus } from "@/lib/types";
import { Lightbulb } from "lucide-react";

// Custom node data interface
export interface MindMapNodeData {
  id: string;
  label: string;
  type: IdeaType | "center";
  status?: IdeaStatus;
  isCenter?: boolean;
}

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

// Get status color
const getStatusColor = (status?: IdeaStatus) => {
  switch (status) {
    case "captured":
      return "bg-primary";
    case "refining":
      return "bg-warning";
    case "validated":
      return "bg-accent";
    case "pursuing":
      return "bg-success";
    case "archived":
      return "bg-danger";
    default:
      return "bg-white/40";
  }
};

// Get type color for nodes
const getTypeColor = (type: IdeaType | "center") => {
  switch (type) {
    case "tech":
      return "from-primary/30 to-primary/10";
    case "business":
      return "from-success/30 to-success/10";
    case "product":
      return "from-warning/30 to-warning/10";
    case "content":
      return "from-accent/30 to-accent/10";
    case "center":
      return "from-primary/40 to-primary-dark/40";
    default:
      return "from-white/20 to-white/10";
  }
};

function MindMapNode({ data }: NodeProps<MindMapNodeData>) {
  const isCenter = data.isCenter;

  // Center node - special styling
  if (isCenter) {
    return (
      <div className="relative">
        <div
          className={`
            px-8 py-6 rounded-2xl
            bg-gradient-to-br ${getTypeColor("center")}
            backdrop-blur-lg
            border-2 border-white/20
            shadow-2xl shadow-primary/30
            min-w-[180px]
            transition-all duration-300
            hover:scale-105 hover:shadow-primary/50
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Lightbulb size={24} className="text-white" />
            </div>
            <div className="font-bold text-lg text-white text-center">
              {data.label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular idea nodes
  return (
    <div className="relative group">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-white/50 !border-2 !border-white/30"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-white/50 !border-2 !border-white/30"
      />

      {/* Node content */}
      <div
        className={`
          px-4 py-3 rounded-xl
          bg-gradient-to-br ${getTypeColor(data.type as IdeaType)}
          backdrop-blur-lg
          border border-white/20
          shadow-lg
          min-w-[160px] max-w-[200px]
          transition-all duration-300
          hover:scale-105 hover:shadow-xl hover:border-white/40
          cursor-pointer
        `}
      >
        <div className="space-y-2">
          {/* Title */}
          <div className="font-semibold text-sm text-white line-clamp-2 leading-tight">
            {data.label}
          </div>

          {/* Badges */}
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant={getTypeBadgeVariant(data.type as IdeaType)}
              className="text-xs px-2 py-0.5"
            >
              {data.type}
            </Badge>

            {/* Status indicator dot */}
            {data.status && (
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`}
                title={data.status}
              />
            )}
          </div>
        </div>
      </div>

      {/* Hover tooltip - full title */}
      <div
        className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-3 py-2 rounded-lg
          bg-black/90 backdrop-blur-lg
          border border-white/20
          text-xs text-white
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          whitespace-normal max-w-[250px]
          z-50
        "
      >
        {data.label}
      </div>
    </div>
  );
}

export default memo(MindMapNode);
