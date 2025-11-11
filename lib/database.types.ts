export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          idea_type: string
          audio_transcript: string | null
          refinement_questions: Json | null
          refinement_answers: Json | null
          refinement_complete: boolean
          validation_result: Json | null
          validation_enabled: boolean
          demand_score: number | null
          competition_score: number | null
          feasibility_score: number | null
          is_worth_pursuing: boolean | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          idea_type: string
          audio_transcript?: string | null
          refinement_questions?: Json | null
          refinement_answers?: Json | null
          refinement_complete?: boolean
          validation_result?: Json | null
          validation_enabled?: boolean
          demand_score?: number | null
          competition_score?: number | null
          feasibility_score?: number | null
          is_worth_pursuing?: boolean | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          idea_type?: string
          audio_transcript?: string | null
          refinement_questions?: Json | null
          refinement_answers?: Json | null
          refinement_complete?: boolean
          validation_result?: Json | null
          validation_enabled?: boolean
          demand_score?: number | null
          competition_score?: number | null
          feasibility_score?: number | null
          is_worth_pursuing?: boolean | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          validation_enabled: boolean
          default_view: string
          subscription_tier: string
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          ideas_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          validation_enabled?: boolean
          default_view?: string
          subscription_tier?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          ideas_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          validation_enabled?: boolean
          default_view?: string
          subscription_tier?: string
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          ideas_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          idea_id: string | null
          name: string
          description: string | null
          status: string
          start_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          progress_percentage: number
          estimated_hours: number | null
          actual_hours: number | null
          budget_usd: number | null
          spent_usd: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id?: string | null
          name: string
          description?: string | null
          status?: string
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          progress_percentage?: number
          estimated_hours?: number | null
          actual_hours?: number | null
          budget_usd?: number | null
          spent_usd?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string | null
          name?: string
          description?: string | null
          status?: string
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          progress_percentage?: number
          estimated_hours?: number | null
          actual_hours?: number | null
          budget_usd?: number | null
          spent_usd?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          idea_id: string | null
          project_id: string | null
          parent_task_id: string | null
          title: string
          description: string | null
          task_type: string | null
          status: string
          priority: string
          assigned_to: string | null
          due_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number | null
          blockers: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id?: string | null
          project_id?: string | null
          parent_task_id?: string | null
          title: string
          description?: string | null
          task_type?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          blockers?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string | null
          project_id?: string | null
          parent_task_id?: string | null
          title?: string
          description?: string | null
          task_type?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          blockers?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      improvements: {
        Row: {
          id: string
          user_id: string
          idea_id: string | null
          project_id: string | null
          title: string
          description: string
          improvement_type: string | null
          source: string | null
          source_details: string | null
          impact_level: string | null
          effort_estimate: string | null
          status: string
          outcome: string | null
          metrics_before: Json | null
          metrics_after: Json | null
          created_at: string
          updated_at: string
          implemented_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          idea_id?: string | null
          project_id?: string | null
          title: string
          description: string
          improvement_type?: string | null
          source?: string | null
          source_details?: string | null
          impact_level?: string | null
          effort_estimate?: string | null
          status?: string
          outcome?: string | null
          metrics_before?: Json | null
          metrics_after?: Json | null
          created_at?: string
          updated_at?: string
          implemented_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string | null
          project_id?: string | null
          title?: string
          description?: string
          improvement_type?: string | null
          source?: string | null
          source_details?: string | null
          impact_level?: string | null
          effort_estimate?: string | null
          status?: string
          outcome?: string | null
          metrics_before?: Json | null
          metrics_after?: Json | null
          created_at?: string
          updated_at?: string
          implemented_at?: string | null
        }
      }
    }
  }
}
