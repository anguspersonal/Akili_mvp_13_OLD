// Backend storage and API types for NPR system

export interface DetailedNPRProfile {
  // Core NPR dimensions based on the research
  cognitiveTraits: {
    workingMemoryCapacity: number; // 1-10 scale
    attentionControl: number;
    processingSpeed: number;
    cognitiveFlexibility: number;
    executiveFunction: number;
  };
  
  learningStyles: string[]; // Visual, Auditory, Kinesthetic, Reading/Writing
  
  neurodiversityProfile: {
    conditions: string[]; // ADHD, Autism, Dyslexia, etc.
    supportNeeds: string[]; // Extra time, visual cues, etc.
    strengths: string[]; // Pattern recognition, creativity, etc.
    challenges: string[]; // Time management, focus, etc.
  };
  
  affectiveProfile: {
    stressManagement: number; // 1-10 scale
    motivationalStyle: string; // Intrinsic, Extrinsic, Mixed
    emotionalRegulation: number;
    needForCognition: number; // How much they enjoy thinking
  };
  
  personalPreferences: {
    communicationStyle: string; // Direct, Supportive, Collaborative
    feedbackPreference: string; // Immediate, Delayed, Visual, Verbal
    workingEnvironment: string; // Structured, Flexible, Mixed
    learningPace: string; // Fast, Moderate, Self-paced
  };
  
  consentAndPrivacy: {
    dataCollection: boolean;
    adaptiveAI: boolean;
    cognitiveInsights: boolean;
    researchParticipation: boolean;
  };
}

// Backend storage structures
export interface StoredNPRProfile {
  userId: string;
  profile: DetailedNPRProfile;
  createdAt: string;
  lastUpdated: string;
  version: number;
  consentGiven: boolean;
  previousVersion?: {
    version: number;
    updatedAt: string;
  };
}

export interface CognitiveInsights {
  userId: string;
  learningStylesSummary: string[];
  primaryStrengths: string[];
  supportNeeds: string[];
  communicationPreference: string;
  lastAnalyzed: string;
  profileVersion?: number;
}

export interface InteractionLog {
  userId: string;
  type: string; // chat, assessment, navigation, etc.
  content?: string; // Limited for privacy
  context?: any;
  adaptations?: string[];
  timestamp: string;
  sessionId: string;
}

export interface UserAnalytics {
  userId: string;
  totalInteractions: number;
  interactionTypes: Record<string, number>;
  lastActive: string;
  cognitiveAdaptations?: string[];
  learningProgress?: Record<string, number>;
}

export interface StoredUserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: string;
  avatar: string | null;
}

// API Request Types
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  nprProfile?: DetailedNPRProfile | null;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface NPRProfileUpdateRequest {
  nprProfile: DetailedNPRProfile;
}

export interface InteractionLogRequest {
  interactionType: string;
  content?: string;
  context?: any;
  adaptations?: string[];
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    hasNprProfile: boolean;
    nprProfile?: DetailedNPRProfile;
  };
  accessToken?: string;
  error?: string;
  message?: string;
}

export interface ProfileResponse {
  success: boolean;
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    nprProfile?: DetailedNPRProfile;
    cognitiveInsights?: CognitiveInsights;
    lastNprUpdate?: string;
  };
  error?: string;
}

export interface NPRUpdateResponse {
  success: boolean;
  message?: string;
  version?: number;
  lastUpdated?: string;
  error?: string;
}

export interface CognitiveInsightsResponse {
  success: boolean;
  insights?: CognitiveInsights;
  error?: string;
}

export interface InteractionLogResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface BaseAPIResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// Error types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Analytics types
export interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  nprProfiles: number;
  interactions: number;
  avgSessionDuration: number;
}

// Export utility type helpers
export type NPRProfileKeys = keyof DetailedNPRProfile;
export type CognitiveTraitKeys = keyof DetailedNPRProfile['cognitiveTraits'];
export type AffectiveProfileKeys = keyof DetailedNPRProfile['affectiveProfile'];
export type PersonalPreferenceKeys = keyof DetailedNPRProfile['personalPreferences'];

// Status enums
export enum ProfileStatus {
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete', 
  UPDATING = 'updating',
  ERROR = 'error'
}

export enum InteractionType {
  CHAT = 'chat',
  ASSESSMENT = 'assessment',
  NAVIGATION = 'navigation',
  SEARCH = 'search',
  FEEDBACK = 'feedback',
  HELP = 'help'
}

export enum ConsentType {
  DATA_COLLECTION = 'dataCollection',
  ADAPTIVE_AI = 'adaptiveAI',
  COGNITIVE_INSIGHTS = 'cognitiveInsights', 
  RESEARCH_PARTICIPATION = 'researchParticipation'
}