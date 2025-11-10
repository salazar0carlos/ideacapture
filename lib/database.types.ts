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
          validation_enabled: boolean
          default_view: string
          created_at: string
        }
        Insert: {
          id?: string
          validation_enabled?: boolean
          default_view?: string
          created_at?: string
        }
        Update: {
          id?: string
          validation_enabled?: boolean
          default_view?: string
          created_at?: string
        }
      }
    }
  }
}
