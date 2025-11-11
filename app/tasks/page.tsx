"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, Circle, Loader2, AlertCircle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  task_type: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  projects: { name: string } | null;
}

export default function TasksPage() {
  const { session, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');

  useEffect(() => {
    if (!authLoading && session) {
      fetchTasks();
    }
  }, [authLoading, session, filter]);

  const fetchTasks = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tasks");

      const result = await response.json();
      if (result.success && result.data) {
        setTasks(result.data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "danger";
      case "high": return "warning";
      case "medium": return "accent";
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
            <Button onClick={fetchTasks}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Tasks</h1>
          <p className="text-white/60 text-lg">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</p>
        </motion.div>

        <div className="mb-6 flex gap-2">
          {['all', 'todo', 'in_progress', 'done'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === status
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "glass text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-white/60">No tasks found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card hover className="flex items-start gap-4 p-4">
                  <button
                    onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 size={24} className="text-success" />
                    ) : (
                      <Circle size={24} className="text-white/30 hover:text-white/60 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className={`font-semibold flex-1 ${task.status === 'done' ? 'line-through text-white/50' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        {task.task_type && <Badge variant="default">{task.task_type}</Badge>}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-white/60 text-sm mb-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-white/50">
                      {task.projects && (
                        <span>Project: {task.projects.name}</span>
                      )}
                      {task.estimated_hours && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
