import { Brain, BarChart3, MessageSquare, Target, Users, Shield } from "lucide-react";

export interface SectionInfo {
  title: string;
  description: string;
}

export const SECTION_INFO: Record<string, SectionInfo> = {
  dashboard: {
    title: "Dashboard",
    description: "Your personalized cognitive cockpit"
  },
  agents: {
    title: "Agent Dashboard", 
    description: "AI agent orchestration and monitoring"
  },
  chat: {
    title: "Chat",
    description: "AI-powered learning companion"
  },
  planning: {
    title: "Planning",
    description: "Strategic planning and organization"
  },
  goals: {
    title: "Goals", 
    description: "Goal setting and tracking"
  },
  profile: {
    title: "Profile",
    description: "Personal settings and preferences"
  },
  fsone: {
    title: "FS:One™ Portal",
    description: "Professional portal coming soon"
  }
};

// Neuropsychography Constants
export const LEARNING_STYLES = [
  "Visual",
  "Auditory", 
  "Kinesthetic",
  "Reading/Writing"
] as const;

export const NEURODIVERSITY_CONDITIONS = [
  "ADHD",
  "Autism Spectrum", 
  "Dyslexia",
  "Dyscalculia",
  "Executive Function Differences",
  "Anxiety",
  "Depression",
  "None"
] as const;

export const SUPPORT_NEEDS = [
  "Extra processing time",
  "Visual cues and reminders", 
  "Structured routines",
  "Frequent breaks",
  "Clear step-by-step instructions",
  "Reduced distractions",
  "Flexible deadlines",
  "Multiple format options"
] as const;

export const COGNITIVE_STRENGTHS = [
  "Pattern recognition",
  "Creative thinking",
  "Attention to detail",
  "Big picture thinking", 
  "Problem solving",
  "Hyperfocus abilities",
  "Innovative approaches",
  "Empathy and intuition"
] as const;

export const COMMUNICATION_STYLES = [
  "Direct",
  "Supportive", 
  "Collaborative"
] as const;

export const FEEDBACK_PREFERENCES = [
  "Immediate",
  "Delayed",
  "Visual", 
  "Verbal"
] as const;

export const WORKING_ENVIRONMENTS = [
  "Structured",
  "Flexible",
  "Mixed"
] as const;

export const LEARNING_PACES = [
  "Fast",
  "Moderate", 
  "Self-paced"
] as const;

export const MOTIVATIONAL_STYLES = [
  "Intrinsic",
  "Extrinsic",
  "Mixed"
] as const;

// NPR Assessment Steps
export const ASSESSMENT_STEPS = [
  {
    id: "introduction",
    title: "Welcome to Your Cognitive Journey",
    description: "Understanding your unique mind for personalized AI support",
    icon: Brain
  },
  {
    id: "cognitive_traits", 
    title: "Cognitive Abilities",
    description: "Help us understand how you process information",
    icon: Brain
  },
  {
    id: "learning_styles",
    title: "Learning Preferences", 
    description: "How do you learn and absorb information best?",
    icon: Brain
  },
  {
    id: "neurodiversity",
    title: "Neurodiversity Profile",
    description: "Celebrating cognitive diversity and individual strengths", 
    icon: Brain
  },
  {
    id: "affective_profile",
    title: "Emotional & Motivational Style",
    description: "Understanding your emotional and motivational patterns",
    icon: Brain
  },
  {
    id: "preferences", 
    title: "Personal Preferences",
    description: "How you prefer to interact and receive support",
    icon: Users
  },
  {
    id: "consent",
    title: "Privacy & Consent", 
    description: "Your data, your control, your privacy",
    icon: Shield
  },
  {
    id: "complete",
    title: "Profile Complete",
    description: "Your personalized AI companion is ready!",
    icon: Brain
  }
];

export const COGNITIVE_TRAIT_RANGES = {
  workingMemoryCapacity: {
    min: 1,
    max: 10,
    low: "Need written notes",
    high: "Keep lots in mind"
  },
  attentionControl: {
    min: 1,
    max: 10, 
    low: "Easily distracted",
    high: "Laser focused"
  },
  processingSpeed: {
    min: 1,
    max: 10,
    low: "Take time to think", 
    high: "Quick responses"
  },
  cognitiveFlexibility: {
    min: 1,
    max: 10,
    low: "Prefer routine",
    high: "Love variety"
  },
  executiveFunction: {
    min: 1,
    max: 10,
    low: "Need structure",
    high: "Self-organizing"
  }
};

export const AFFECTIVE_TRAIT_RANGES = {
  stressManagement: {
    min: 1,
    max: 10,
    low: "High stress sensitivity",
    high: "Very resilient"
  },
  emotionalRegulation: {
    min: 1,
    max: 10,
    low: "Emotions run high",
    high: "Very controlled"
  },
  needForCognition: {
    min: 1,
    max: 10,
    low: "Prefer simple tasks", 
    high: "Love complex challenges"
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/make-server-feeffd69/auth/signup',
    SIGNIN: '/make-server-feeffd69/auth/signin'
  },
  USER: {
    PROFILE: (userId: string) => `/make-server-feeffd69/user/${userId}/profile`,
    NPR_PROFILE: (userId: string) => `/make-server-feeffd69/user/${userId}/npr-profile`,
    COGNITIVE_INSIGHTS: (userId: string) => `/make-server-feeffd69/user/${userId}/cognitive-insights`,
    INTERACTION: (userId: string) => `/make-server-feeffd69/user/${userId}/interaction`
  }
} as const;

export const DEMO_USERS = [
  {
    email: "learner@akilii.com",
    password: "demo123",
    name: "Alex Chen", 
    role: "learner" as const,
    description: "Student with ADHD and visual learning preferences"
  },
  {
    email: "educator@akilii.com",
    password: "demo123", 
    name: "Sarah Johnson",
    role: "educator" as const,
    description: "Special education teacher using akilii™ tools"
  },
  {
    email: "professional@fsone.com",
    password: "demo123",
    name: "Dr. Michael Torres", 
    role: "professional" as const,
    description: "EHCP coordinator using FS:One™ portal"
  }
] as const;