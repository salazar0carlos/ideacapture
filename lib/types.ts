// Idea Types
export type IdeaType = 'tech' | 'business' | 'product' | 'content' | 'other';

export type IdeaStatus = 'captured' | 'refining' | 'validated' | 'pursuing' | 'archived';

// Main Idea Interface
export interface Idea {
  id: string;
  title: string;
  description?: string;
  idea_type: IdeaType;
  audio_transcript?: string;

  // Refinement
  refinement_questions?: RefinementQuestion[];
  refinement_answers?: Record<string, string>;
  refinement_complete: boolean;

  // Validation
  validation_result?: ValidationResult;
  validation_enabled: boolean;
  demand_score?: number;
  competition_score?: number;
  feasibility_score?: number;
  is_worth_pursuing?: boolean;

  // Metadata
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

// Refinement Question Interface
export interface RefinementQuestion {
  id: string;
  question: string;
  category: 'problem' | 'solution' | 'market' | 'feasibility' | 'other';
  required: boolean;
}

// Validation Result Interface
export interface ValidationResult {
  overall_score: number;
  demand: {
    score: number;
    analysis: string;
    signals: string[];
  };
  competition: {
    score: number;
    analysis: string;
    competitors: string[];
  };
  feasibility: {
    score: number;
    analysis: string;
    challenges: string[];
  };
  recommendation: {
    should_pursue: boolean;
    reasoning: string;
    next_steps: string[];
  };
  generated_at: string;
}

// User Settings Interface
export interface UserSettings {
  id: string;
  validation_enabled: boolean;
  default_view: 'list' | 'grid' | 'mindmap';
  created_at: string;
}

// API Request/Response Types
export interface CreateIdeaRequest {
  title: string;
  description?: string;
  idea_type: IdeaType;
  audio_transcript?: string;
}

export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  idea_type?: IdeaType;
  refinement_answers?: Record<string, string>;
  refinement_complete?: boolean;
  status?: IdeaStatus;
}

export interface ValidateIdeaRequest {
  idea_id: string;
  force_revalidation?: boolean;
}

export interface ValidateIdeaResponse {
  success: boolean;
  validation_result: ValidationResult;
}

// Utility Types
export type IdeaTypeColors = {
  [key in IdeaType]: {
    bg: string;
    text: string;
    border: string;
  };
};
