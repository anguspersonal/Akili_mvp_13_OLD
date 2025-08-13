import { UserRole } from "../components/Navigation";

// Core user types - simplified for frontend use
export interface NPRProfile {
  conditions: string[];
  learningStyles: string[];
  supportNeeds: string[];
  strengths: string[];
  challenges: string[];
}

export interface UserPreferences {
  enableFileUploads?: boolean;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  theme?: 'light' | 'dark' | 'darker';
  fontSize?: number;
  enableNotifications?: boolean;
  enableSpeechInput?: boolean;
  enableStreamingResponses?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nprProfile?: NPRProfile;
  preferences?: UserPreferences;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ResponsiveComponentProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'premium';
}

// Theme and UI types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'darker';
  glassMorphism: boolean;
  animations: boolean;
  customizations: Record<string, any>;
}

export interface FontSizeConfig {
  scale: number; // 0.75 to 1.5
  baseSize: number; // Base font size in px
  adaptive: boolean;
}

// Navigation and routing types  
export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  path: string;
  roles?: UserRole[];
  badge?: string;
  isExternal?: boolean;
}

export interface SectionProps {
  userRole: UserRole;
  userName: string;
  nprProfile?: NPRProfile;
}

// Form and input types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'slider';
  required?: boolean;
  placeholder?: string;
  options?: Array<{value: string; label: string}>;
  validation?: (value: any) => string | null;
  defaultValue?: any;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Message and chat types
export interface ChatMessage {
  id: string;
  content: string | React.ReactNode;
  role: 'user' | 'assistant';
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  nprAdaptations?: string[];
  thinking?: boolean;
  streaming?: boolean;
  attachments?: AttachedFile[];
  transcription?: boolean;
  followUps?: FollowUpSuggestion[];
}

export interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'pdf' | 'spreadsheet' | 'code' | 'other';
  url: string;
  uploadProgress: number;
  uploaded: boolean;
  error?: string;
  preview?: string;
}

export interface FollowUpSuggestion {
  id: string;
  text: string;
  icon: string;
  category: string;
  priority: number;
  reasoning?: string;
}

// Dashboard and widget types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'action' | 'info';
  size: 'small' | 'medium' | 'large' | 'full';
  data?: any;
  config?: Record<string, any>;
  permissions?: UserRole[];
  nprAdaptive?: boolean;
}

export interface DashboardLayout {
  userId: string;
  widgets: DashboardWidget[];
  customizations: Record<string, any>;
  lastUpdated: Date;
}

// Agent and AI types
export interface Agent {
  id: string;
  name: string;
  type: 'core' | 'persona';
  status: 'active' | 'idle' | 'processing' | 'error';
  description: string;
  icon: React.ComponentType<any>;
  metrics: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  };
  lastActivity: Date;
  capabilities: string[];
}

export interface AgentMetrics {
  totalTasks: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  adaptationAccuracy: number;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Event and analytics types
export interface UserEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
  errorInfo?: any;
}

// Export commonly used utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Re-export constants for convenience
export { SECTION_INFO } from './constants';
export type { SectionInfo } from './constants';