export interface User {
  id: string;
  name: string;
  email: string;
  goals: string[];
  joinDate: Date;
  streak: number;
  mood?: number;
  tasks?: Task[];
  moodHistory?: MoodEntry[];
}

export interface GoalOption {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface MoodEntry {
  id: string;
  mood: number;
  note?: string;
  date: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface MoodOption {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}