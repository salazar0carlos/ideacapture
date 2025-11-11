"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Folder, Plus, Loader2, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress_percentage: number;
  created_at: string;
  ideas: { title: string; idea_type: string } | null;
}

export default function ProjectsPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session) {
      fetchProjects();
    }
  }, [authLoading, session]);

  const fetchProjects = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/projects`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const result = await response.json();
      if (result.success && result.data) {
        setProjects(result.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "completed": return "accent";
      case "paused": return "warning";
      case "abandoned": return "danger";
      default: return "default";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle size={40} className="text-danger" />
            <p className="text-white/60">{error}</p>
            <Button onClick={fetchProjects}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center py-16">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <Folder size={48} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-3">No projects yet</h2>
                  <p className="text-white/60 max-w-md mx-auto text-lg mb-6">
                    Convert your validated ideas into projects with AI-generated tasks
                  </p>
                  <Button variant="primary" size="lg" onClick={() => router.push("/ideas")}>
                    View Ideas
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Projects</h1>
          <p className="text-white/60 text-lg">{projects.length} {projects.length === 1 ? "project" : "projects"}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="cursor-pointer h-full flex flex-col" onClick={() => router.push(`/projects/${project.id}`)}>
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white line-clamp-2 flex-1">{project.name}</h3>
                    <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>

                  {project.description && (
                    <p className="text-white/60 text-sm line-clamp-2">{project.description}</p>
                  )}

                  {project.ideas && (
                    <div className="text-xs text-white/50">From idea: {project.ideas.title}</div>
                  )}

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white font-medium">{project.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
