import React, { useState, useEffect } from 'react';
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
  Eye,
  Cpu,
  Lightbulb,
  Settings,
  Award,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner@2.0.3';
import { User } from '../utils/types';
import { flowiseService } from '../utils/flowiseService';
import { AnimatedAkiliiLogoAdvanced } from './AnimatedAkiliiLogo';

interface AdaptiveDashboardProps {
  user: User;
}

// NPR-adaptive data based on cognitive profiles
const getCognitiveData = (profile: any) => {
  if (!profile) return [];
  
  return [
    { name: 'Visual Processing', value: profile.cognitiveStyle === 'visual' ? 90 : 70 },
    { name: 'Analytical Thinking', value: profile.cognitiveStyle === 'analytical' ? 95 : 75 },
    { name: 'Creative Problem Solving', value: profile.cognitiveStyle === 'creative' ? 88 : 65 },
    { name: 'Information Processing', value: profile.processingSpeed === 'fast' ? 85 : 70 },
    { name: 'Communication', value: profile.communicationStyle === 'detailed' ? 82 : 78 },
    { name: 'Learning Adaptation', value: profile.learningPreference === 'hands-on' ? 90 : 80 }
  ];
};

const getPersonalizedActivities = (profile: any) => {
  const activities = [
    { 
      action: 'NPR-adapted AI session completed', 
      time: '15 minutes ago', 
      icon: Brain, 
      color: 'text-akilii-purple',
      improvement: '+12% cognitive alignment'
    },
    { 
      action: 'Visual learning path updated', 
      time: '1 hour ago', 
      icon: Eye, 
      color: 'text-akilii-teal',
      improvement: '+8% visual processing'
    },
    { 
      action: 'Analytical thinking exercise', 
      time: '2 hours ago', 
      icon: Cpu, 
      color: 'text-akilii-orange',
      improvement: '+15% logical reasoning'
    },
    { 
      action: 'Creative brainstorming session', 
      time: '4 hours ago', 
      icon: Lightbulb, 
      color: 'text-akilii-yellow',
      improvement: '+22% creative output'
    }
  ];

  // Filter based on user's cognitive style
  if (profile?.cognitiveStyle === 'visual') {
    return activities.filter(a => a.icon === Eye || a.icon === Brain);
  } else if (profile?.cognitiveStyle === 'analytical') {
    return activities.filter(a => a.icon === Cpu || a.icon === Brain);
  } else if (profile?.cognitiveStyle === 'creative') {
    return activities.filter(a => a.icon === Lightbulb || a.icon === Brain);
  }
  
  return activities;
};

const adaptiveMetrics = {
  visual: {
    icon: Eye,
    color: 'akilii-gradient-primary',
    metrics: [
      { label: 'Visual Comprehension', value: 92, trend: '+5%' },
      { label: 'Pattern Recognition', value: 88, trend: '+12%' },
      { label: 'Spatial Reasoning', value: 85, trend: '+8%' }
    ]
  },
  analytical: {
    icon: Cpu,
    color: 'akilii-gradient-secondary',
    metrics: [
      { label: 'Logical Processing', value: 94, trend: '+15%' },
      { label: 'Problem Solving', value: 91, trend: '+10%' },
      { label: 'Critical Analysis', value: 89, trend: '+7%' }
    ]
  },
  creative: {
    icon: Lightbulb,
    color: 'akilii-gradient-accent',
    metrics: [
      { label: 'Creative Thinking', value: 96, trend: '+18%' },
      { label: 'Innovation Score', value: 87, trend: '+22%' },
      { label: 'Idea Generation', value: 93, trend: '+14%' }
    ]
  }
};

export function AdaptiveDashboard({ user }: AdaptiveDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [personalizedInsight, setPersonalizedInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [adaptiveProgress, setAdaptiveProgress] = useState(85);
  const [cognitiveGrowth, setCognitiveGrowth] = useState(0);

  const nprProfile = user.nprProfile;
  const cognitiveStyle = nprProfile?.cognitiveStyle || 'analytical';
  const currentMetrics = adaptiveMetrics[cognitiveStyle as keyof typeof adaptiveMetrics] || adaptiveMetrics.analytical;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Generate personalized NPR insight
  useEffect(() => {
    const generatePersonalizedInsight = async () => {
      setIsLoadingInsight(true);
      try {
        const nprContext = `User has NPR profile: ${cognitiveStyle} cognitive style, ${nprProfile?.learningPreference} learning preference, ${nprProfile?.communicationStyle} communication style`;
        
        const response = await flowiseService.query(
          `Based on this NPR profile: "${nprContext}", provide a personalized insight for ${user.name} (${user.role}) about optimizing their cognitive strengths today. Focus on their ${cognitiveStyle} thinking style. Keep it encouraging and actionable.`,
          user,
          { context: 'NPR-Adaptive Dashboard personalized insight generation' }
        );
        
        setPersonalizedInsight(response.text || `Your ${cognitiveStyle} cognitive style is perfectly aligned with akilii™'s adaptive AI. Today, focus on leveraging your natural thinking patterns for maximum productivity!`);
      } catch (error) {
        setPersonalizedInsight(`Your ${cognitiveStyle} cognitive style is your superpower! akilii™ has adapted to enhance your natural thinking patterns.`);
      } finally {
        setIsLoadingInsight(false);
      }
    };

    generatePersonalizedInsight();
  }, [user, cognitiveStyle, nprProfile]);

  // Simulate cognitive growth
  useEffect(() => {
    const interval = setInterval(() => {
      setCognitiveGrowth(prev => Math.min(prev + 0.1, 100));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const styleEmoji = cognitiveStyle === 'visual' ? '👁️' : cognitiveStyle === 'analytical' ? '🧮' : '💡';
    
    if (hour < 12) return `Good morning ${styleEmoji}`;
    if (hour < 17) return `Good afternoon ${styleEmoji}`;
    return `Good evening ${styleEmoji}`;
  };

  const handleAdaptiveAction = async (action: string) => {
    toast.success(`${action} optimized for your ${cognitiveStyle} style!`, {
      description: `NPR-adaptive ${action.toLowerCase()} launched for ${user.name}`,
      duration: 2000
    });

    // Simulate adaptive learning
    setAdaptiveProgress(prev => Math.min(prev + 5, 100));
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      
      {/* NPR-Adaptive Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black akilii-gradient-text">
              {getGreeting()}, {user.name}! 
            </h1>
            <p className="akilii-two-tone-text-subtle flex items-center gap-2">
              NPR-Adaptive Dashboard powered by <AnimatedAkiliiLogoAdvanced size="xs" animated={true} inline={true} className="inline-flex" />
              <Badge className={`text-xs ${currentMetrics.color} text-primary-foreground border-0 px-2 py-1`}>
                <Brain className="h-3 w-3 mr-1" />
                {cognitiveStyle} optimized
              </Badge>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="text-xs akilii-gradient-primary text-primary-foreground border-0 px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Badge>
            <Badge className="text-xs akilii-glass text-foreground border-border px-3 py-1">
              <Award className="h-3 w-3 mr-1" />
              {adaptiveProgress.toFixed(0)}% Adapted
            </Badge>
          </div>
        </div>

        {/* Personalized NPR Insight Card */}
        <Card className="akilii-glass-elevated border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <motion.div
                className={`w-10 h-10 ${currentMetrics.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <currentMetrics.icon className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  NPR-Personalized Insight
                  <Badge className="text-xs akilii-gradient-accent text-primary-foreground border-0 px-2 py-0.5">
                    {cognitiveGrowth.toFixed(1)}% growth
                  </Badge>
                </h3>
                {isLoadingInsight ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      className="flex gap-1"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </motion.div>
                    Analyzing your cognitive patterns...
                  </div>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">{personalizedInsight}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cognitive Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {currentMetrics.metrics.map((metric, index) => (
          <Card key={index} className="akilii-glass border-border hover:akilii-glass-elevated transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{metric.label}</span>
                <Badge className="text-xs akilii-gradient-secondary text-primary-foreground border-0">
                  {metric.trend}
                </Badge>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{metric.value}%</span>
                <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
              </div>
              <Progress value={metric.value} className="mt-2 h-2" />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* NPR-Adaptive Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="akilii-glass-elevated border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-akilii-yellow" />
              NPR-Optimized Actions
              <Badge className="text-xs akilii-gradient-primary text-primary-foreground border-0 px-2 py-0.5">
                {cognitiveStyle} enhanced
              </Badge>
            </CardTitle>
            <CardDescription>
              Actions personalized for your {cognitiveStyle} cognitive style
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="ghost"
                onClick={() => handleAdaptiveAction('Adaptive Chat')}
                className="h-auto flex-col gap-2 p-4 akilii-glass hover:akilii-glass-elevated border border-border"
              >
                <MessageSquare className="h-5 w-5 text-akilii-teal" />
                <span className="text-xs">Smart Chat</span>
                <Badge className="text-xs px-1 py-0 bg-akilii-teal/20 text-akilii-teal border-0">
                  NPR
                </Badge>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAdaptiveAction('Cognitive Planning')}
                className="h-auto flex-col gap-2 p-4 akilii-glass hover:akilii-glass-elevated border border-border"
              >
                <Calendar className="h-5 w-5 text-akilii-pink" />
                <span className="text-xs">Mind Planning</span>
                <Badge className="text-xs px-1 py-0 bg-akilii-pink/20 text-akilii-pink border-0">
                  NPR
                </Badge>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAdaptiveAction('Adaptive Learning')}
                className="h-auto flex-col gap-2 p-4 akilii-glass hover:akilii-glass-elevated border border-border"
              >
                <BookOpen className="h-5 w-5 text-akilii-orange" />
                <span className="text-xs">Style Learning</span>
                <Badge className="text-xs px-1 py-0 bg-akilii-orange/20 text-akilii-orange border-0">
                  NPR
                </Badge>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAdaptiveAction('Cognitive Analysis')}
                className="h-auto flex-col gap-2 p-4 akilii-glass hover:akilii-glass-elevated border border-border"
              >
                <Brain className="h-5 w-5 text-akilii-purple" />
                <span className="text-xs">Brain Tune</span>
                <Badge className="text-xs px-1 py-0 bg-akilii-purple/20 text-akilii-purple border-0">
                  NPR
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced NPR Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Tabs defaultValue="cognitive" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 akilii-glass border border-border">
            <TabsTrigger value="cognitive" className="text-xs">Cognitive Map</TabsTrigger>
            <TabsTrigger value="adaptation" className="text-xs">AI Adaptation</TabsTrigger>
            <TabsTrigger value="growth" className="text-xs">Neural Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="cognitive" className="space-y-4">
            <Card className="akilii-glass-elevated border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-akilii-purple" />
                  Cognitive Profile Radar
                </CardTitle>
                <CardDescription>
                  Your NPR cognitive strengths visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getCognitiveData(nprProfile)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Cognitive Strength"
                        dataKey="value"
                        stroke="#ff6b9d"
                        fill="#ff6b9d"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adaptation" className="space-y-4">
            <Card className="akilii-glass-elevated border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-akilii-teal" />
                  AI Adaptation Progress
                </CardTitle>
                <CardDescription>
                  How akilii™ learns your cognitive patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall NPR Adaptation</span>
                    <span className="text-lg font-bold">{adaptiveProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={adaptiveProgress} className="h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Communication Style Match</span>
                    <Progress value={92} className="h-2" />
                    <span className="text-xs text-muted-foreground">92% aligned</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Learning Preference Sync</span>
                    <Progress value={88} className="h-2" />
                    <span className="text-xs text-muted-foreground">88% optimized</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Cognitive Style Integration</span>
                    <Progress value={95} className="h-2" />
                    <span className="text-xs text-muted-foreground">95% personalized</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Processing Speed Adaptation</span>
                    <Progress value={83} className="h-2" />
                    <span className="text-xs text-muted-foreground">83% calibrated</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <Card className="akilii-glass-elevated border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-akilii-orange" />
                  Cognitive Growth Tracking
                </CardTitle>
                <CardDescription>
                  Your cognitive enhancement journey with akilii™
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <motion.div
                      className="text-4xl font-black akilii-gradient-text mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      +{cognitiveGrowth.toFixed(1)}%
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Total cognitive enhancement this month</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 akilii-glass rounded-lg border border-border">
                      <div className="text-xl font-bold text-akilii-teal">+15%</div>
                      <div className="text-xs text-muted-foreground">Processing Speed</div>
                    </div>
                    
                    <div className="text-center p-4 akilii-glass rounded-lg border border-border">
                      <div className="text-xl font-bold text-akilii-pink">+22%</div>
                      <div className="text-xs text-muted-foreground">Problem Solving</div>
                    </div>
                    
                    <div className="text-center p-4 akilii-glass rounded-lg border border-border">
                      <div className="text-xl font-bold text-akilii-orange">+18%</div>
                      <div className="text-xs text-muted-foreground">Memory Retention</div>
                    </div>
                    
                    <div className="text-center p-4 akilii-glass rounded-lg border border-border">
                      <div className="text-xl font-bold text-akilii-yellow">+12%</div>
                      <div className="text-xs text-muted-foreground">Focus Duration</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* NPR-Personalized Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="akilii-glass-elevated border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-akilii-blue" />
              NPR-Adaptive Activity Feed
            </CardTitle>
            <CardDescription>
              Recent activities optimized for your {cognitiveStyle} cognitive style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getPersonalizedActivities(nprProfile).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 akilii-glass rounded-lg border border-border hover:akilii-glass-elevated transition-all duration-200"
              >
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                  <Badge className="text-xs mt-1 bg-green-500/20 text-green-600 border-0 px-2 py-0">
                    {activity.improvement}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-sm">
              View NPR Activity History
              <Brain className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* NPR Footer Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center py-4"
      >
        <p className="text-sm akilii-two-tone-text-subtle flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-akilii-pink" />
          Your {cognitiveStyle} mind + <AnimatedAkiliiLogoAdvanced size="xs" animated={true} inline={true} className="inline-flex mx-1" /> NPR = Limitless potential
        </p>
      </motion.div>
    </div>
  );
}

export default AdaptiveDashboard;