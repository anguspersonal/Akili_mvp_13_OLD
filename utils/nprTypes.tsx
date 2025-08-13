import { User } from '@supabase/supabase-js';

// Base Supabase User type extension
export interface AuthUser extends User {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

// Merkle Tree Cryptographic Types
export interface MerkleNode {
  hash: string;
  data?: any;
  left?: MerkleNode;
  right?: MerkleNode;
  timestamp: Date;
}

export interface MerkleTree {
  root: MerkleNode;
  leaves: MerkleNode[];
  depth: number;
}

export interface MerkleProof {
  leaf: string;
  path: Array<{
    hash: string;
    isLeft: boolean;
  }>;
  root: string;
}

export interface CryptographicSignature {
  algorithm: 'sha256' | 'sha512';
  hash: string;
  salt: string;
  timestamp: Date;
}

// Enhanced Psychometric Assessment Types
export interface CognitiveAssessment {
  working_memory: {
    score: number; // 0-100
    percentile: number;
    tasks_completed: string[];
    timestamp: Date;
  };
  processing_speed: {
    score: number;
    percentile: number;
    reaction_times: number[];
    timestamp: Date;
  };
  attention: {
    sustained_attention: number;
    selective_attention: number;
    divided_attention: number;
    timestamp: Date;
  };
  executive_function: {
    cognitive_flexibility: number;
    inhibitory_control: number;
    planning_ability: number;
    timestamp: Date;
  };
  verbal_ability: {
    vocabulary_score: number;
    comprehension_score: number;
    fluency_score: number;
    timestamp: Date;
  };
  spatial_ability: {
    mental_rotation: number;
    spatial_visualization: number;
    spatial_memory: number;
    timestamp: Date;
  };
}

export interface PersonalityProfile {
  big_five: {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    timestamp: Date;
  };
  cognitive_style: {
    field_independence: number;
    analytical_vs_intuitive: number;
    sequential_vs_random: number;
    concrete_vs_abstract: number;
    timestamp: Date;
  };
  learning_preferences: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading_writing: number;
    timestamp: Date;
  };
  decision_making: {
    risk_tolerance: number;
    time_orientation: number; // present vs future focus
    detail_orientation: number;
    timestamp: Date;
  };
}

export interface EmotionalIntelligence {
  self_awareness: {
    emotional_self_awareness: number;
    accurate_self_assessment: number;
    self_confidence: number;
    timestamp: Date;
  };
  self_regulation: {
    emotional_self_control: number;
    adaptability: number;
    achievement_orientation: number;
    positive_outlook: number;
    timestamp: Date;
  };
  social_awareness: {
    empathy: number;
    organizational_awareness: number;
    service_orientation: number;
    timestamp: Date;
  };
  relationship_management: {
    influence: number;
    coach_mentor: number;
    conflict_management: number;
    team_leadership: number;
    timestamp: Date;
  };
}

export interface StandardizedAssessments {
  cognitive_reflection_test: {
    score: number; // 0-7
    response_times: number[];
    intuitive_answers: number;
    reflective_answers: number;
    timestamp: Date;
  };
  stroop_test: {
    congruent_rt: number[];
    incongruent_rt: number[];
    interference_effect: number;
    accuracy: number;
    timestamp: Date;
  };
  tower_of_london: {
    planning_accuracy: number;
    execution_time: number[];
    moves_efficiency: number;
    timestamp: Date;
  };
  digit_span: {
    forward_span: number;
    backward_span: number;
    sequencing_span: number;
    timestamp: Date;
  };
  mental_rotation: {
    accuracy: number;
    response_time: number[];
    angular_disparity_effect: number;
    timestamp: Date;
  };
}

// Enhanced NPR Entry Types
export interface NPREntry {
  id: string;
  type: 'goal' | 'challenge' | 'strength' | 'preference' | 'reflection' | 'assessment' | 'interaction';
  content: string;
  timestamp: Date;
  metadata: {
    source?: 'socratic' | 'assessment' | 'user_input' | 'ai_generated';
    confidence?: number; // 0-1
    validation_status?: 'pending' | 'validated' | 'flagged';
    assessment_type?: keyof StandardizedAssessments;
    cognitive_domain?: keyof CognitiveAssessment;
    personality_facet?: string;
    [key: string]: any;
  };
  // Cryptographic integrity
  signature: CryptographicSignature;
  merkle_proof?: MerkleProof;
}

// Comprehensive NPR Profile
export interface NPRProfile {
  id: string;
  user_id: string;
  comm_preference: 'direct' | 'analogical';
  cognitive_assessment: CognitiveAssessment;
  personality_profile: PersonalityProfile;
  emotional_intelligence: EmotionalIntelligence;
  standardized_assessments: StandardizedAssessments;
  learning_history: {
    preferred_modalities: string[];
    adaptation_patterns: string[];
    performance_trends: { [key: string]: number[] };
    timestamp: Date;
  };
  behavioral_patterns: {
    interaction_style: 'explorative' | 'goal_directed' | 'social' | 'analytical';
    engagement_level: number; // 0-100
    persistence_level: number;
    help_seeking_behavior: 'independent' | 'collaborative' | 'guided';
    timestamp: Date;
  };
  created_at: Date;
  updated_at: Date;
  // Cryptographic integrity for entire profile
  profile_signature: CryptographicSignature;
  merkle_tree?: MerkleTree;
}

// Legacy compatibility - simplified entries structure
export interface NPREntries {
  goal?: NPREntry;
  challenge?: NPREntry;
  strength?: NPREntry;
  preference?: NPREntry;
  allEntries: NPREntry[];
}

export interface NPRUserProfile {
  entries: NPREntries;
  profile: NPRProfile | null;
  psychometric_battery: {
    completion_status: {
      cognitive_assessment: boolean;
      personality_profile: boolean;
      emotional_intelligence: boolean;
      standardized_assessments: boolean;
    };
    last_assessment_date: Date | null;
    next_scheduled_assessment: Date | null;
  };
  // Cryptographic verification
  verification: {
    is_verified: boolean;
    last_verification_date: Date | null;
    merkle_root_hash: string | null;
    integrity_status: 'valid' | 'compromised' | 'pending';
  };
}

// Task Types (Enhanced)
export interface NPRTask {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  is_ai_generated: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  due_date: Date | null;
  tags: string[];
  // NPR-enhanced task fields
  cognitive_demand: {
    working_memory: number; // 0-5
    attention: number;
    processing_speed: number;
    executive_function: number;
  };
  personality_alignment: {
    matches_user_style: boolean;
    adaptation_notes: string;
    difficulty_adjustment: number; // -2 to +2
  };
  completion_context: {
    mood_at_creation?: string;
    energy_level?: number;
    stress_level?: number;
    time_of_day?: string;
  };
  // Cryptographic integrity
  task_signature: CryptographicSignature;
}

// Response Types for Service Layer
export interface NPRResponseResult {
  success: boolean;
  error?: string;
  entry?: NPREntry;
  task?: NPRTask;
  content?: string;
  response?: string;
}

export interface NPRTaskResult {
  success: boolean;
  error?: string;
  task?: NPRTask;
  tasks: NPRTask[];
}

export interface NPRProfileResult {
  success: boolean;
  error?: string;
  profile?: NPRUserProfile;
}

// Assessment Session Types
export interface AssessmentSession {
  id: string;
  user_id: string;
  session_type: 'cognitive' | 'personality' | 'emotional_intelligence' | 'standardized';
  status: 'in_progress' | 'completed' | 'paused' | 'cancelled';
  current_step: number;
  total_steps: number;
  started_at: Date;
  completed_at?: Date;
  results: {
    raw_scores: { [key: string]: any };
    percentiles: { [key: string]: number };
    interpretations: string[];
    recommendations: string[];
  };
  session_data: {
    responses: any[];
    reaction_times: number[];
    interaction_patterns: string[];
    device_info: {
      user_agent: string;
      screen_size: { width: number; height: number };
      timezone: string;
    };
  };
  // Cryptographic integrity
  session_signature: CryptographicSignature;
}

// Cryptographic Utility Types
export interface NPRCryptoService {
  generateHash(data: any, algorithm?: 'sha256' | 'sha512'): Promise<string>;
  generateSalt(): string;
  signData(data: any): Promise<CryptographicSignature>;
  verifySignature(data: any, signature: CryptographicSignature): Promise<boolean>;
  createMerkleTree(entries: NPREntry[]): MerkleTree;
  generateMerkleProof(tree: MerkleTree, entry: NPREntry): MerkleProof;
  verifyMerkleProof(proof: MerkleProof): boolean;
  updateMerkleTree(tree: MerkleTree, newEntry: NPREntry): MerkleTree;
}

// Real-time NPR Adaptation Types
export interface NPRAdaptationContext {
  current_cognitive_load: number; // 0-100
  fatigue_level: number;
  mood_state: string;
  recent_performance: { [domain: string]: number };
  environmental_factors: {
    time_of_day: string;
    session_duration: number;
    interruption_count: number;
  };
  interaction_history: {
    preferred_content_types: string[];
    successful_strategies: string[];
    avoided_patterns: string[];
  };
}

// NPR Insights and Recommendations
export interface NPRInsight {
  id: string;
  type: 'cognitive_pattern' | 'learning_optimization' | 'performance_prediction' | 'intervention_recommendation';
  title: string;
  description: string;
  confidence: number; // 0-1
  supporting_data: {
    assessment_scores: { [key: string]: number };
    behavioral_patterns: string[];
    temporal_trends: { [key: string]: number[] };
  };
  actionable_recommendations: {
    immediate_actions: string[];
    long_term_strategies: string[];
    environmental_modifications: string[];
  };
  generated_at: Date;
  expires_at?: Date;
  // Cryptographic integrity
  insight_signature: CryptographicSignature;
}

// Export for backward compatibility
export type User = AuthUser;

// Validation schemas (for runtime type checking)
export const NPRValidationSchemas = {
  cognitiveAssessment: {
    required: ['working_memory', 'processing_speed', 'attention', 'executive_function'],
    ranges: {
      working_memory: { min: 0, max: 100 },
      processing_speed: { min: 0, max: 100 },
      attention: { min: 0, max: 100 }
    }
  },
  personalityProfile: {
    required: ['big_five', 'cognitive_style', 'learning_preferences'],
    ranges: {
      big_five: { min: 0, max: 100 },
      cognitive_style: { min: 0, max: 100 }
    }
  }
};