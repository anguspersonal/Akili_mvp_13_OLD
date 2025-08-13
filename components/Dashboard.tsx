import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Target, 
  Zap, 
  Users, 
  Activity,
  BookOpen,
  Star,
  Clock,
  ChevronRight,
  Plus,
  BarChart3,
  PieChart,
  Sparkles,
  Heart,
  Coffee,
  Rocket,
  Award,
  Lightbulb,
  Globe,
  Cpu,
  Layers,
  Shield,
  Smile,
  TrendingDown,
  ArrowUpRight,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Eye,
  Download,
  Upload,
  Settings,
  Bell,
  Share2,
  Bookmark,
  Filter,
  Search,
  MoreHorizontal,
  Mic,
  Video,
  FileText,
  Image as ImageIcon,
  Link,
  Calculator,
  Map,
  Music,
  Palette,
  Camera,
  Phone,
  Mail,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { User } from '../utils/types';
import { flowiseService } from '../utils/flowiseService';
import { ReliableAkiliiLogo, AkiliiTextFallback } from './AnimatedAkiliiLogo';

interface DashboardProps {
  user: User;
}

// Enhanced sample data for comprehensive dashboard
const weeklyActivityData = [
  { name: 'Mon', messages: 24, sessions: 6, insights: 15, productivity: 85, mood: 8.2 },
  { name: 'Tue', messages: 32, sessions: 8, insights: 22, productivity: 92, mood: 8.7 },
  { name: 'Wed', messages: 28, sessions: 7, insights: 18, productivity: 88, mood: 8.4 },
  { name: 'Thu', messages: 45, sessions: 11, insights: 28, productivity: 95, mood: 9.1 },
  { name: 'Fri', messages: 38, sessions: 9, insights: 24, productivity: 90, mood: 8.8 },
  { name: 'Sat', messages: 16, sessions: 4, insights: 12, productivity: 78, mood: 7.9 },
  { name: 'Sun', messages: 22, sessions: 5, insights: 16, productivity: 82, mood: 8.3 }
];

const featureUsageData = [
  { name: 'AI Chat', value: 35, color: '#ff6b9d', icon: MessageSquare },
  { name: 'Planning', value: 28, color: '#4ecdc4', icon: Calendar },
  { name: 'Learning', value: 22, color: '#ffe66d', icon: BookOpen },
  { name: 'Research', value: 15, color: '#ff8c42', icon: Search }
];

const productivityData = [
  { category: 'Daily Tasks', completed: 18, total: 22, percentage: 82, trend: '+12%' },
  { category: 'Weekly Goals', completed: 7, total: 10, percentage: 70, trend: '+8%' },
  { category: 'AI Interactions', completed: 45, total: 50, percentage: 90, trend: '+25%' },
  { category: 'Learning Modules', completed: 12, total: 15, percentage: 80, trend: '+15%' },
  { category: 'Creative Projects', completed: 5, total: 8, percentage: 63, trend: '+5%' },
  { category: 'Collaboration', completed: 9, total: 12, percentage: 75, trend: '+18%' }
];

const aiInsightsData = [
  {
    id: 1,
    type: 'productivity',
    title: 'Peak Performance Hours',
    description: 'Your productivity peaks between 10-11 AM. Schedule important tasks during this window.',
    confidence: 94,
    actionable: true,
    icon: TrendingUp,
    color: '#4ecdc4'
  },
  {
    id: 2,
    type: 'learning',
    title: 'Learning Pattern Detected',
    description: 'You learn 40% faster with visual content. Try incorporating more diagrams and videos.',
    confidence: 87,
    actionable: true,
    icon: Brain,
    color: '#ffe66d'
  },
  {
    id: 3,
    type: 'wellbeing',
    title: 'Mood Enhancement',
    description: 'Short breaks every 45 minutes improve your mood scores by 15%.',
    confidence: 91,
    actionable: true,
    icon: Heart,
    color: '#ff6b9d'
  },
  {
    id: 4,
    type: 'efficiency',
    title: 'Communication Style',
    description: 'Concise messages get 60% faster responses. Keep your communications brief.',
    confidence: 89,
    actionable: true,
    icon: MessageSquare,
    color: '#a8e6cf'
  }
];

const quickActionsData = [
  { id: 1, title: 'New AI Chat', icon: MessageSquare, color: '#4ecdc4', description: 'Start conversing with AI' },
  { id: 2, title: 'Smart Planning', icon: Calendar, color: '#ff6b9d', description: 'AI-powered scheduling' },
  { id: 3, title: 'Learning Path', icon: BookOpen, color: '#ffe66d', description: 'Personalized learning' },
  { id: 4, title: 'NPR Assessment', icon: Brain, color: '#a8e6cf', description: 'Cognitive profiling' },
  { id: 5, title: 'Voice Session', icon: Mic, color: '#ff8c42', description: 'Voice interaction' },
  { id: 6, title: 'Visual Studio', icon: Palette, color: '#74b9ff', description: 'Creative workspace' },
  { id: 7, title: 'Research Hub', icon: Search, color: '#fd79a8', description: 'Deep research tools' },
  { id: 8, title: 'Collaboration', icon: Users, color: '#00cec9', description: 'Team workspace' }
];

const recentActivityData = [
  { 
    id: 1, 
    action: 'Completed AI strategy session', 
    time: '3 minutes ago', 
    icon: Rocket, 
    color: 'text-akilii-teal',
    type: 'achievement',
    details: 'Generated 15 actionable insights'
  },
  { 
    id: 2, 
    action: 'Updated quarterly planning board', 
    time: '12 minutes ago', 
    icon: Target, 
    color: 'text-akilii-pink',
    type: 'productivity',
    details: 'Added 8 new objectives'
  },
  { 
    id: 3, 
    action: 'Finished advanced learning module', 
    time: '1 hour ago', 
    icon: Award, 
    color: 'text-akilii-yellow',
    type: 'learning',
    details: 'Neural networks fundamentals'
  },
  { 
    id: 4, 
    action: 'Earned productivity streak badge', 
    time: '2 hours ago', 
    icon: Star, 
    color: 'text-akilii-orange',
    type: 'achievement',
    details: '7-day consistency milestone'
  },
  { 
    id: 5, 
    action: 'Shared insights with team', 
    time: '4 hours ago', 
    icon: Share2, 
    color: 'text-akilii-purple',
    type: 'collaboration',
    details: 'Weekly AI performance report'
  },
  { 
    id: 6, 
    action: 'Completed NPR cognitive assessment', 
    time: '1 day ago', 
    icon: Brain, 
    color: 'text-akilii-blue',
    type: 'assessment',
    details: 'Updated cognitive profile'
  }
];

export function Dashboard({ user }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [dashboardStats, setDashboardStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    avgProductivity: 0,
    completedTasks: 0,
    learningHours: 0,
    aiInteractions: 0,
    moodScore: 0,
    streakDays: 0
  });
  const [activeInsight, setActiveInsight] = useState(0);
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Rotate AI insights
  useEffect(() => {
    const insightTimer = setInterval(() => {
      setActiveInsight(prev => (prev + 1) % aiInsightsData.length);
    }, 8000);
    return () => clearInterval(insightTimer);
  }, []);

  // Calculate comprehensive dashboard stats
  useEffect(() => {
    const stats = weeklyActivityData.reduce((acc, day) => ({
      totalSessions: acc.totalSessions + day.sessions,
      totalMessages: acc.totalMessages + day.messages,
      avgProductivity: acc.avgProductivity + day.productivity,
      completedTasks: acc.completedTasks + day.insights,
      learningHours: acc.learningHours + (day.sessions * 0.75),
      aiInteractions: acc.aiInteractions + day.messages,
      moodScore: acc.moodScore + day.mood,
      streakDays: 7
    }), { 
      totalSessions: 0, 
      totalMessages: 0, 
      avgProductivity: 0, 
      completedTasks: 0,
      learningHours: 0,
      aiInteractions: 0,
      moodScore: 0,
      streakDays: 0
    });

    stats.avgProductivity = Math.round(stats.avgProductivity / weeklyActivityData.length);
    stats.moodScore = Math.round((stats.moodScore / weeklyActivityData.length) * 10) / 10;
    stats.learningHours = Math.round(stats.learningHours * 10) / 10;
    
    setDashboardStats(stats);
  }, []);

  // Generate personalized AI insight
  useEffect(() => {
    const generateInsight = async () => {
      setIsLoadingInsight(true);
      try {
        const contextData = {
          role: user.role,
          productivity: dashboardStats.avgProductivity,
          mood: dashboardStats.moodScore,
          sessions: dashboardStats.totalSessions,
          timeOfDay: currentTime.getHours()
        };

        const response = await flowiseService.query(
          `Based on ${user.name} being a ${user.role} with ${dashboardStats.avgProductivity}% productivity this week and mood score of ${dashboardStats.moodScore}/10, provide a brief personalized insight or motivational tip. Current time is ${currentTime.getHours()}:00. Keep it encouraging, specific, and actionable.`,
          user,
          { context: 'Personalized dashboard insight generation', data: contextData }
        );
        
        setAiInsight(response.text || `Great momentum this week, ${user.name}! Your ${dashboardStats.avgProductivity}% productivity shows excellent progress. Keep leveraging AI to unlock your potential!`);
      } catch (error) {
        setAiInsight(`Welcome back, ${user.name}! Ready to achieve new breakthroughs with AI today? Your journey toward cognitive excellence continues!`);
      } finally {
        setIsLoadingInsight(false);
      }
    };

    if (dashboardStats.avgProductivity > 0) {
      generateInsight();
    }
  }, [user, dashboardStats, currentTime]);

  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    const greetings = {
      morning: ['Good morning', 'Rise and shine', 'Morning, superstar'],
      afternoon: ['Good afternoon', 'Afternoon, achiever', 'Midday momentum'],
      evening: ['Good evening', 'Evening, innovator', 'Sunset success']
    };
    
    let timeOfDay: keyof typeof greetings;
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';
    
    const options = greetings[timeOfDay];
    return options[Math.floor(Math.random() * options.length)];
  }, [currentTime]);

  const handleQuickAction = async (action: string, id: number) => {
    const actionData = quickActionsData.find(item => item.id === id);
    
    toast.success(`${action} launched!`, {
      description: actionData?.description || `Starting ${action.toLowerCase()} for ${user.name}`,
      duration: 3000
    });

    console.log(`Quick action launched: ${action} (${actionData?.description})`);
  };

  const getCurrentInsight = () => aiInsightsData[activeInsight];

  return (
    <div className="h-full overflow-y-auto relative">
      {/* Enhanced Background Effects */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-5"
          animate={{
            background: [
              'radial-gradient(circle, #ff6b9d 0%, transparent 70%)',
              'radial-gradient(circle, #4ecdc4 0%, transparent 70%)',
              'radial-gradient(circle, #ffe66d 0%, transparent 70%)',
              'radial-gradient(circle, #ff6b9d 0%, transparent 70%)',
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 left-32 w-64 h-64 rounded-full opacity-3"
          animate={{
            background: [
              'radial-gradient(circle, #a8e6cf 0%, transparent 70%)',
              'radial-gradient(circle, #ff8c42 0%, transparent 70%)',
              'radial-gradient(circle, #74b9ff 0%, transparent 70%)',
              'radial-gradient(circle, #a8e6cf 0%, transparent 70%)',
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </motion.div>

      <div className="relative z-10 p-4 md:p-6 space-y-6">
        
        {/* Enhanced Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Main Welcome Section */}
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <motion.h1 
                className="text-3xl md:text-4xl font-black akilii-gradient-text-slow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {getGreeting()}, {user.name}! 
                <motion.span
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="inline-block ml-2"
                >
                  ✨
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="akilii-two-tone-text-subtle text-lg flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Welcome to your personalized 
                <ReliableAkiliiLogo 
                  size="sm" 
                  animated={true} 
                  inline={true} 
                  className="inline-flex mx-1" 
                  glowEffect={false} 
                  colorCycle={true} 
                  interactive={true} 
                />
                cognitive cockpit
              </motion.p>
            </div>
            
            {/* Time and Status Badges */}
            <motion.div 
              className="flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(78, 205, 196, 0.2)',
                    '0 0 20px rgba(78, 205, 196, 0.4)',
                    '0 0 10px rgba(78, 205, 196, 0.2)',
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Badge className="text-sm akilii-gradient-primary text-primary-foreground border-0 px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </motion.div>
              
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(255, 107, 157, 0.2)',
                    '0 0 20px rgba(255, 107, 157, 0.4)',
                    '0 0 10px rgba(255, 107, 157, 0.2)',
                  ]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <Badge className="text-sm akilii-glass text-foreground border-border px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {user.role}
                </Badge>
              </motion.div>
            </motion.div>
          </div>

          {/* AI Insight Carousel */}
          <Card className="akilii-glass-elevated border-border overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  animate={{
                    background: [
                      'linear-gradient(135deg, #ff6b9d, #4ecdc4)',
                      'linear-gradient(135deg, #4ecdc4, #ffe66d)',
                      'linear-gradient(135deg, #ffe66d, #a8e6cf)',
                      'linear-gradient(135deg, #a8e6cf, #ff6b9d)',
                    ]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Lightbulb className="h-6 w-6 text-white relative z-10" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg akilii-gradient-text">AI Insight</h3>
                    <div className="flex items-center gap-2">
                      {aiInsightsData.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === activeInsight ? 'bg-akilii-teal' : 'bg-border'
                          }`}
                          animate={index === activeInsight ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {isLoadingInsight ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 text-muted-foreground"
                      >
                        <motion.div
                          className="w-3 h-3 bg-akilii-teal rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span>Generating personalized insight...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="insight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-foreground leading-relaxed mb-3">{aiInsight}</p>
                        
                        {/* Current rotating insight */}
                        <motion.div
                          key={activeInsight}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center gap-3 p-3 akilii-glass rounded-lg border border-border"
                        >
                          <motion.div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: getCurrentInsight().color + '20' }}
                          >
                            {React.createElement(getCurrentInsight().icon, {
                              className: "h-4 w-4",
                              style: { color: getCurrentInsight().color }
                            })}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{getCurrentInsight().title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {getCurrentInsight().confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{getCurrentInsight().description}</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { 
              title: 'AI Sessions', 
              value: dashboardStats.totalSessions, 
              subtitle: 'This week',
              icon: MessageSquare, 
              gradient: 'akilii-gradient-primary',
              trend: '+23%',
              trendUp: true
            },
            { 
              title: 'Productivity', 
              value: `${dashboardStats.avgProductivity}%`, 
              subtitle: 'Average score',
              icon: TrendingUp, 
              gradient: 'akilii-gradient-secondary',
              trend: '+12%',
              trendUp: true
            },
            { 
              title: 'Learning Hours', 
              value: dashboardStats.learningHours, 
              subtitle: 'Total time',
              icon: BookOpen, 
              gradient: 'akilii-gradient-accent',
              trend: '+8%',
              trendUp: true
            },
            { 
              title: 'Mood Score', 
              value: dashboardStats.moodScore, 
              subtitle: '/10 wellbeing',
              icon: Heart, 
              gradient: 'akilii-text-gradient',
              trend: '+5%',
              trendUp: true
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="akilii-glass border-border hover:akilii-glass-elevated transition-all duration-300 overflow-hidden relative">
                <CardContent className="p-6">
                  {/* Trend indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${stat.gradient} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <motion.div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.trend}
                    </motion.div>
                  </div>
                  
                  <div className="space-y-1">
                    <motion.div 
                      className="text-2xl font-black text-foreground"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{stat.title}</div>
                    <div className="text-xs akilii-two-tone-text-subtle">{stat.subtitle}</div>
                  </div>
                </CardContent>
                
                {/* Animated background effect */}
                <motion.div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  animate={{
                    background: [
                      'linear-gradient(45deg, transparent, var(--akilii-teal))',
                      'linear-gradient(45deg, var(--akilii-teal), transparent)',
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.8
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Quick Actions Hub */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="akilii-glass-elevated border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-6 w-6 text-akilii-yellow" />
                    </motion.div>
                    Quick Actions Hub
                  </CardTitle>
                  <CardDescription className="akilii-two-tone-text-subtle flex items-center gap-2 mt-2">
                    Launch your most-used 
                    <ReliableAkiliiLogo 
                      size="xs" 
                      animated={true} 
                      inline={true} 
                      className="inline-flex" 
                      glowEffect={false} 
                      colorCycle={true} 
                      interactive={true} 
                    />
                    features instantly
                  </CardDescription>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge variant="outline" className="text-xs">
                    <Rocket className="h-3 w-3 mr-1" />
                    8 Actions
                  </Badge>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActionsData.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleQuickAction(action.title, action.id)}
                      className="h-auto flex-col gap-3 p-4 akilii-glass hover:akilii-glass-elevated border border-border group relative overflow-hidden transition-all duration-300"
                    >
                      {/* Animated background on hover */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        style={{ backgroundColor: action.color }}
                      />
                      
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                        style={{ backgroundColor: action.color + '20' }}
                        animate={{
                          boxShadow: [
                            `0 0 0 0 ${action.color}00`,
                            `0 0 0 4px ${action.color}20`,
                            `0 0 0 0 ${action.color}00`,
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      >
                        <action.icon className="h-5 w-5" style={{ color: action.color }} />
                      </motion.div>
                      
                      <div className="text-center relative z-10">
                        <span className="text-sm font-medium block">{action.title}</span>
                        <span className="text-xs text-muted-foreground block mt-1">
                          {action.description}
                        </span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Tabs defaultValue="activity" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-fit grid-cols-4 akilii-glass border border-border">
                <TabsTrigger value="activity" className="text-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="productivity" className="text-sm">
                  <Target className="h-4 w-4 mr-2" />
                  Goals
                </TabsTrigger>
                <TabsTrigger value="usage" className="text-sm">
                  <PieChart className="h-4 w-4 mr-2" />
                  Usage
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="akilii-glass border-border"
                  onClick={() => setSelectedTimeframe(selectedTimeframe === 'week' ? 'month' : 'week')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedTimeframe === 'week' ? 'This Week' : 'This Month'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="akilii-glass border-border"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Activity Analytics */}
            <TabsContent value="activity" className="space-y-4">
              <Card className="akilii-glass-elevated border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-akilii-teal" />
                    Weekly Performance Analytics
                  </CardTitle>
                  <CardDescription className="akilii-two-tone-text-subtle flex items-center gap-2">
                    <span>Your comprehensive</span>
                    <ReliableAkiliiLogo 
                      size="xs" 
                      animated={true} 
                      inline={true} 
                      className="inline-flex" 
                      glowEffect={false} 
                      colorCycle={true} 
                      interactive={true} 
                    />
                    <span>performance metrics and trends</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyActivityData}>
                        <defs>
                          <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff6b9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff6b9d" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffe66d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ffe66d" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="messages"
                          stroke="#ff6b9d"
                          fillOpacity={1}
                          fill="url(#messagesGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="productivity"
                          stroke="#4ecdc4"
                          fillOpacity={0.6}
                          fill="url(#productivityGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="mood"
                          stroke="#ffe66d"
                          fillOpacity={0.4}
                          fill="url(#moodGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Productivity Goals */}
            <TabsContent value="productivity" className="space-y-4">
              <Card className="akilii-glass-elevated border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <Target className="h-5 w-5 text-akilii-orange" />
                    Goal Progress & Achievements
                  </CardTitle>
                  <CardDescription className="akilii-two-tone-text-subtle flex items-center gap-2">
                    <span>Track your progress with</span>
                    <ReliableAkiliiLogo 
                      size="xs" 
                      animated={true} 
                      inline={true} 
                      className="inline-flex" 
                      glowEffect={false} 
                      colorCycle={true} 
                      interactive={true} 
                    />
                    <span>AI-powered insights</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {productivityData.map((goal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="p-4 akilii-glass rounded-lg border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#4ecdc4' + '20' }}
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                          >
                            <Target className="h-4 w-4 text-akilii-teal" />
                          </motion.div>
                          <div>
                            <span className="font-medium text-sm">{goal.category}</span>
                            <div className="text-xs text-muted-foreground">
                              {goal.completed}/{goal.total} completed
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {goal.trend}
                          </Badge>
                          <span className="text-lg font-bold text-foreground">
                            {goal.percentage}%
                          </span>
                        </div>
                      </div>
                      <Progress value={goal.percentage} className="h-2" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Usage */}
            <TabsContent value="usage" className="space-y-4">
              <Card className="akilii-glass-elevated border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-akilii-pink" />
                    Feature Usage Distribution
                  </CardTitle>
                  <CardDescription className="akilii-two-tone-text-subtle flex items-center gap-2">
                    <span>How you engage with</span>
                    <ReliableAkiliiLogo 
                      size="xs" 
                      animated={true} 
                      inline={true} 
                      className="inline-flex" 
                      glowEffect={false} 
                      colorCycle={true} 
                      interactive={true} 
                    />
                    <span>platform features</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <ChartContainer config={{}} className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <RechartsPieChart data={featureUsageData} cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                            {featureUsageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </RechartsPieChart>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    
                    <div className="space-y-3">
                      {featureUsageData.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center justify-between p-3 akilii-glass rounded-lg border border-border"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: item.color + '20' }}
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                            >
                              <item.icon className="h-4 w-4" style={{ color: item.color }} />
                            </motion.div>
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="w-16 h-2 bg-border rounded-full overflow-hidden"
                              initial={{ width: 0 }}
                              animate={{ width: 64 }}
                              transition={{ delay: index * 0.2, duration: 0.8 }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ delay: index * 0.3, duration: 1 }}
                              />
                            </motion.div>
                            <span className="font-bold text-sm">{item.value}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights */}
            <TabsContent value="insights" className="space-y-4">
              <Card className="akilii-glass-elevated border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <Brain className="h-5 w-5 text-akilii-purple" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription className="akilii-two-tone-text-subtle flex items-center gap-2">
                    <span>Personalized recommendations from</span>
                    <ReliableAkiliiLogo 
                      size="xs" 
                      animated={true} 
                      inline={true} 
                      className="inline-flex" 
                      glowEffect={false} 
                      colorCycle={true} 
                      interactive={true} 
                    />
                    <span>cognitive analysis</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsightsData.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="p-4 akilii-glass rounded-lg border border-border space-y-3"
                      whileHover={{ scale: 1.01, y: -2 }}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: insight.color + '20' }}
                          animate={{
                            boxShadow: [
                              `0 0 0 0 ${insight.color}00`,
                              `0 0 0 4px ${insight.color}30`,
                              `0 0 0 0 ${insight.color}00`,
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.5
                          }}
                        >
                          <insight.icon className="h-5 w-5" style={{ color: insight.color }} />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% confidence
                              </Badge>
                              {insight.actionable && (
                                <Badge className="text-xs akilii-gradient-primary text-primary-foreground border-0">
                                  Actionable
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Share2 className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="akilii-glass-elevated border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <Activity className="h-5 w-5 text-akilii-blue" />
                    Recent Activity Timeline
                  </CardTitle>
                  <CardDescription className="akilii-two-tone-text-subtle flex items-center gap-2 mt-2">
                    <span>Your latest interactions and achievements with</span>
                    <ReliableAkiliiLogo 
                      size="xs" 
                      animated={true} 
                      inline={true} 
                      className="inline-flex" 
                      glowEffect={false} 
                      colorCycle={true} 
                      interactive={true} 
                    />
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Live Updates
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="text-xs"
                  >
                    {showAllActivities ? 'Show Less' : 'Show All'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(showAllActivities ? recentActivityData : recentActivityData.slice(0, 4)).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="flex items-center gap-4 p-4 akilii-glass rounded-lg border border-border hover:akilii-glass-elevated transition-all duration-300 group"
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    animate={{
                      background: [
                        'linear-gradient(135deg, #4ecdc4, #ff6b9d)',
                        'linear-gradient(135deg, #ff6b9d, #ffe66d)',
                        'linear-gradient(135deg, #ffe66d, #4ecdc4)',
                      ]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <activity.icon className="h-5 w-5 text-white relative z-10" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{activity.action}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' :
                          activity.type === 'learning' ? 'bg-blue-100 text-blue-700' :
                          activity.type === 'productivity' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{activity.time}</span>
                      <span className="text-foreground font-medium">{activity.details}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
                </motion.div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-sm">
                <Eye className="h-4 w-4 mr-2" />
                View Full Activity History
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Enhanced Footer Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center py-8"
        >
          <motion.div
            className="space-y-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-lg akilii-two-tone-text-subtle flex items-center justify-center gap-3 flex-wrap">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-5 w-5 text-akilii-pink" />
              </motion.span>
              <span>Keep exploring with</span>
              <ReliableAkiliiLogo 
                size="sm" 
                animated={true} 
                inline={true} 
                className="inline-flex mx-1" 
                glowEffect={false} 
                colorCycle={true} 
                interactive={true} 
              />
              <span>- AI for every unique mind</span>
              <motion.span
                animate={{ rotate: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Sparkles className="h-5 w-5 text-akilii-yellow" />
              </motion.span>
            </p>
            
            <motion.div
              className="flex items-center justify-center gap-6 flex-wrap opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-akilii-teal" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-akilii-purple" />
                <span>NPR-Adaptive</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-akilii-blue" />
                <span>Always Learning</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;