import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Alert, AlertDescription } from "./ui/alert";
import { RobotMascot } from "./AkiliiLogo";
import { AkiliiBrand } from "./AkiliiBrand";
import {
  Brain,
  Heart,
  Eye,
  Ear,
  Users,
  Clock,
  Target,
  Lightbulb,
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Info,
  Sparkles,
  Star,
  Palette,
  BookOpen,
  PenTool,
  Headphones,
  Activity
} from "lucide-react";

export interface NPRProfile {
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

interface NPRAssessmentProps {
  onComplete: (profile: NPRProfile) => void;
  onSkip: () => void;
  className?: string;
}

const assessmentSteps = [
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
    icon: Lightbulb
  },
  {
    id: "learning_styles",
    title: "Learning Preferences",
    description: "How do you learn and absorb information best?",
    icon: BookOpen
  },
  {
    id: "neurodiversity",
    title: "Neurodiversity Profile",
    description: "Celebrating cognitive diversity and individual strengths",
    icon: Sparkles
  },
  {
    id: "affective_profile",
    title: "Emotional & Motivational Style",
    description: "Understanding your emotional and motivational patterns",
    icon: Heart
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
    icon: Star
  }
];

// Helper function to ensure arrays are valid
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

// Helper function to safely check if array includes value
const safeIncludes = (arr: any, value: string): boolean => {
  return Array.isArray(arr) && arr.includes(value);
};

export function NPRAssessment({ onComplete, onSkip, className = "" }: NPRAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<NPRProfile>({
    cognitiveTraits: {
      workingMemoryCapacity: 5,
      attentionControl: 5,
      processingSpeed: 5,
      cognitiveFlexibility: 5,
      executiveFunction: 5
    },
    learningStyles: [],
    neurodiversityProfile: {
      conditions: [],
      supportNeeds: [],
      strengths: [],
      challenges: []
    },
    affectiveProfile: {
      stressManagement: 5,
      motivationalStyle: "Mixed",
      emotionalRegulation: 5,
      needForCognition: 5
    },
    personalPreferences: {
      communicationStyle: "Supportive",
      feedbackPreference: "Immediate",
      workingEnvironment: "Mixed",
      learningPace: "Self-paced"
    },
    consentAndPrivacy: {
      dataCollection: false,
      adaptiveAI: false,
      cognitiveInsights: false,
      researchParticipation: false
    }
  });

  const progress = ((currentStep + 1) / assessmentSteps.length) * 100;
  const currentStepData = assessmentSteps[currentStep];

  const updateProfile = (section: keyof NPRProfile, data: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  // Safe update function for arrays
  const updateArrayField = (section: keyof NPRProfile, field: string, newArray: string[]) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Array.isArray(newArray) ? newArray : []
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(profile);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (assessmentSteps[currentStep].id) {
      case "introduction":
        return (
          <div className="text-center space-y-6">
            <motion.div
              animate={{ 
                y: [-5, 5, -5],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <RobotMascot size="2xl" animated={true} variant="celebrating" />
            </motion.div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white">
                Welcome to <AkiliiBrand size="lg" inline />
              </h2>
              <p className="text-white/80 leading-relaxed">
                You're about to create your unique <strong>Neuropsychographic Profile</strong> – 
                a personalized map of how your mind works best. This helps our AI companion 
                understand and adapt to your individual cognitive style, learning preferences, 
                and support needs.
              </p>
              
              <Alert className="akilii-glass border-blue-400/30 text-left">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <strong>Your Privacy Matters:</strong> All data is encrypted, stored securely, 
                  and used only to personalize your experience. You maintain full control and 
                  can modify or delete your profile at any time.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: Brain, label: "Cognitive Style", color: "from-purple-500 to-pink-500" },
                  { icon: BookOpen, label: "Learning Prefs", color: "from-blue-500 to-teal-500" },
                  { icon: Heart, label: "Emotional Patterns", color: "from-pink-500 to-rose-500" },
                  { icon: Sparkles, label: "Unique Strengths", color: "from-yellow-500 to-orange-500" }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.4 }}
                    className="text-center"
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "cognitive_traits":
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold text-white mb-2">Cognitive Abilities Assessment</h3>
              <p className="text-white/70">
                Rate yourself on these cognitive dimensions. There are no right or wrong answers – 
                we're learning about your unique cognitive style.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  key: "workingMemoryCapacity",
                  label: "Working Memory",
                  description: "How well can you hold and manipulate information in your mind?",
                  low: "Need written notes",
                  high: "Keep lots in mind"
                },
                {
                  key: "attentionControl",
                  label: "Attention Control",
                  description: "How well can you focus and avoid distractions?",
                  low: "Easily distracted",
                  high: "Laser focused"
                },
                {
                  key: "processingSpeed",
                  label: "Processing Speed",
                  description: "How quickly do you process and respond to information?",
                  low: "Take time to think",
                  high: "Quick responses"
                },
                {
                  key: "cognitiveFlexibility",
                  label: "Cognitive Flexibility",
                  description: "How easily can you switch between different concepts or approaches?",
                  low: "Prefer routine",
                  high: "Love variety"
                },
                {
                  key: "executiveFunction",
                  label: "Executive Function",
                  description: "How well do you plan, organize, and manage tasks?",
                  low: "Need structure",
                  high: "Self-organizing"
                }
              ].map((trait) => (
                <Card key={trait.key} className="akilii-glass border-white/20">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{trait.label}</h4>
                        <p className="text-white/70 text-sm">{trait.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Slider
                          value={[profile.cognitiveTraits[trait.key as keyof typeof profile.cognitiveTraits]]}
                          onValueChange={([value]) => 
                            updateProfile("cognitiveTraits", { [trait.key]: value })
                          }
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        
                        <div className="flex justify-between text-xs text-white/60">
                          <span>{trait.low}</span>
                          <span className="font-medium text-white">
                            {profile.cognitiveTraits[trait.key as keyof typeof profile.cognitiveTraits]}
                          </span>
                          <span>{trait.high}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "learning_styles":
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold text-white mb-2">Learning Style Preferences</h3>
              <p className="text-white/70">
                Select all the ways you prefer to learn and process information. 
                Most people have multiple learning styles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "Visual",
                  icon: Eye,
                  title: "Visual Learning",
                  description: "Charts, diagrams, images, and spatial relationships",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  id: "Auditory",
                  icon: Headphones,
                  title: "Auditory Learning",
                  description: "Spoken explanations, discussions, and sound patterns",
                  color: "from-purple-500 to-violet-500"
                },
                {
                  id: "Kinesthetic",
                  icon: Activity,
                  title: "Kinesthetic Learning",
                  description: "Hands-on activities, movement, and physical engagement",
                  color: "from-orange-500 to-red-500"
                },
                {
                  id: "Reading/Writing",
                  icon: PenTool,
                  title: "Reading/Writing",
                  description: "Text-based information, lists, and written exercises",
                  color: "from-blue-500 to-teal-500"
                }
              ].map((style) => (
                <motion.div
                  key={style.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      safeIncludes(profile.learningStyles, style.id)
                        ? "akilii-glass-premium border-blue-400/50 bg-blue-500/10"
                        : "akilii-glass border-white/20 hover:border-white/30"
                    }`}
                    onClick={() => {
                      const currentStyles = ensureArray(profile.learningStyles);
                      const newStyles = currentStyles.includes(style.id)
                        ? currentStyles.filter(s => s !== style.id)
                        : [...currentStyles, style.id];
                      updateArrayField("learningStyles", "learningStyles", newStyles);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${style.color} flex items-center justify-center flex-shrink-0`}>
                          <style.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{style.title}</h4>
                          <p className="text-white/70 text-sm">{style.description}</p>
                        </div>
                        {safeIncludes(profile.learningStyles, style.id) && (
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "neurodiversity":
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">Neurodiversity Profile</h3>
              <p className="text-white/70">
                Help us understand your unique neurological profile to provide better support. 
                All information is confidential and used only for personalization.
              </p>
            </div>

            <div className="space-y-6">
              {/* Conditions */}
              <Card className="akilii-glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Neurodiversity Conditions (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "ADHD", "Autism Spectrum", "Dyslexia", "Dyscalculia", 
                    "Executive Function Differences", "Anxiety", "Depression", "None"
                  ].map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={safeIncludes(profile.neurodiversityProfile.conditions, condition)}
                        onCheckedChange={(checked) => {
                          const currentConditions = ensureArray(profile.neurodiversityProfile.conditions);
                          const conditions = checked
                            ? [...currentConditions, condition]
                            : currentConditions.filter(c => c !== condition);
                          updateProfile("neurodiversityProfile", { conditions });
                        }}
                      />
                      <Label htmlFor={condition} className="text-white/80 text-sm">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support Needs */}
              <Card className="akilii-glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Support Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Extra processing time", "Visual cues and reminders", "Structured routines",
                    "Frequent breaks", "Clear step-by-step instructions", "Reduced distractions",
                    "Flexible deadlines", "Multiple format options"
                  ].map((need) => (
                    <div key={need} className="flex items-center space-x-2">
                      <Checkbox
                        id={need}
                        checked={safeIncludes(profile.neurodiversityProfile.supportNeeds, need)}
                        onCheckedChange={(checked) => {
                          const currentNeeds = ensureArray(profile.neurodiversityProfile.supportNeeds);
                          const supportNeeds = checked
                            ? [...currentNeeds, need]
                            : currentNeeds.filter(s => s !== need);
                          updateProfile("neurodiversityProfile", { supportNeeds });
                        }}
                      />
                      <Label htmlFor={need} className="text-white/80 text-sm">
                        {need}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card className="akilii-glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Your Cognitive Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Pattern recognition", "Creative thinking", "Attention to detail",
                    "Big picture thinking", "Problem solving", "Hyperfocus abilities",
                    "Innovative approaches", "Empathy and intuition"
                  ].map((strength) => (
                    <div key={strength} className="flex items-center space-x-2">
                      <Checkbox
                        id={strength}
                        checked={safeIncludes(profile.neurodiversityProfile.strengths, strength)}
                        onCheckedChange={(checked) => {
                          const currentStrengths = ensureArray(profile.neurodiversityProfile.strengths);
                          const strengths = checked
                            ? [...currentStrengths, strength]
                            : currentStrengths.filter(s => s !== strength);
                          updateProfile("neurodiversityProfile", { strengths });
                        }}
                      />
                      <Label htmlFor={strength} className="text-white/80 text-sm">
                        {strength}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "affective_profile":
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Heart className="h-12 w-12 mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-bold text-white mb-2">Emotional & Motivational Profile</h3>
              <p className="text-white/70">
                Understanding your emotional patterns helps us provide better support during 
                different states and situations.
              </p>
            </div>

            <div className="space-y-6">
              {/* Stress Management */}
              <Card className="akilii-glass border-white/20">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Stress Management</h4>
                    <p className="text-white/70 text-sm">How well do you handle stress and pressure?</p>
                  </div>
                  
                  <Slider
                    value={[profile.affectiveProfile.stressManagement]}
                    onValueChange={([value]) => 
                      updateProfile("affectiveProfile", { stressManagement: value })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-white/60">
                    <span>High stress sensitivity</span>
                    <span className="font-medium text-white">
                      {profile.affectiveProfile.stressManagement}
                    </span>
                    <span>Very resilient</span>
                  </div>
                </CardContent>
              </Card>

              {/* Motivational Style */}
              <Card className="akilii-glass border-white/20">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Motivational Style</h4>
                    <p className="text-white/70 text-sm">What drives and motivates you most?</p>
                  </div>
                  
                  <RadioGroup
                    value={profile.affectiveProfile.motivationalStyle}
                    onValueChange={(value) => updateProfile("affectiveProfile", { motivationalStyle: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Intrinsic" id="intrinsic" />
                      <Label htmlFor="intrinsic" className="text-white/80">
                        Intrinsic - Personal satisfaction, curiosity, mastery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Extrinsic" id="extrinsic" />
                      <Label htmlFor="extrinsic" className="text-white/80">
                        Extrinsic - Rewards, recognition, external validation
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Mixed" id="mixed" />
                      <Label htmlFor="mixed" className="text-white/80">
                        Mixed - Combination of both internal and external motivators
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Need for Cognition */}
              <Card className="akilii-glass border-white/20">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Need for Cognition</h4>
                    <p className="text-white/70 text-sm">How much do you enjoy thinking and mental challenges?</p>
                  </div>
                  
                  <Slider
                    value={[profile.affectiveProfile.needForCognition]}
                    onValueChange={([value]) => 
                      updateProfile("affectiveProfile", { needForCognition: value })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Prefer simple tasks</span>
                    <span className="font-medium text-white">
                      {profile.affectiveProfile.needForCognition}
                    </span>
                    <span>Love complex challenges</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-teal-400" />
              <h3 className="text-xl font-bold text-white mb-2">Personal Preferences</h3>
              <p className="text-white/70">
                Tell us how you prefer to interact and receive support from your AI companion.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  key: "communicationStyle",
                  title: "Communication Style",
                  description: "How would you like your AI to communicate with you?",
                  options: [
                    { value: "Direct", label: "Direct - Clear, concise, to the point" },
                    { value: "Supportive", label: "Supportive - Encouraging and empathetic" },
                    { value: "Collaborative", label: "Collaborative - Partnership approach" }
                  ]
                },
                {
                  key: "feedbackPreference",
                  title: "Feedback Preference", 
                  description: "How do you prefer to receive feedback and suggestions?",
                  options: [
                    { value: "Immediate", label: "Immediate - Real-time suggestions" },
                    { value: "Delayed", label: "Delayed - Time to process first" },
                    { value: "Visual", label: "Visual - Charts, graphics, visual cues" },
                    { value: "Verbal", label: "Verbal - Spoken or text explanations" }
                  ]
                },
                {
                  key: "workingEnvironment",
                  title: "Working Environment",
                  description: "What kind of structure works best for you?",
                  options: [
                    { value: "Structured", label: "Structured - Clear plans and schedules" },
                    { value: "Flexible", label: "Flexible - Adaptive and spontaneous" },
                    { value: "Mixed", label: "Mixed - Balance of structure and flexibility" }
                  ]
                },
                {
                  key: "learningPace",
                  title: "Learning Pace",
                  description: "How do you prefer to pace your learning and work?",
                  options: [
                    { value: "Fast", label: "Fast - Quick progression and challenges" },
                    { value: "Moderate", label: "Moderate - Steady, consistent pace" },
                    { value: "Self-paced", label: "Self-paced - I control the timing" }
                  ]
                }
              ].map((preference) => (
                <Card key={preference.key} className="akilii-glass border-white/20">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-1">{preference.title}</h4>
                      <p className="text-white/70 text-sm">{preference.description}</p>
                    </div>
                    
                    <RadioGroup
                      value={profile.personalPreferences[preference.key as keyof typeof profile.personalPreferences]}
                      onValueChange={(value) => updateProfile("personalPreferences", { [preference.key]: value })}
                    >
                      {preference.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`${preference.key}-${option.value}`} />
                          <Label htmlFor={`${preference.key}-${option.value}`} className="text-white/80 text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "consent":
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold text-white mb-2">Privacy & Consent</h3>
              <p className="text-white/70">
                Your data, your control. Choose what you're comfortable sharing to personalize your experience.
              </p>
            </div>

            <Alert className="akilii-glass border-blue-400/30">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-white space-y-2">
                <p><strong>Your Rights:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Access and review your profile at any time</li>
                  <li>Modify or delete any information</li>
                  <li>Export your data in standard formats</li>
                  <li>Withdraw consent and delete your profile</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {[
                {
                  key: "dataCollection",
                  title: "Basic Data Collection",
                  description: "Allow collection of basic interaction data to personalize your AI experience",
                  required: true
                },
                {
                  key: "adaptiveAI",
                  title: "Adaptive AI Learning",
                  description: "Enable your AI to learn from your interactions and improve over time",
                  required: false
                },
                {
                  key: "cognitiveInsights",
                  title: "Cognitive Insights",
                  description: "Receive insights about your cognitive patterns and learning progress",
                  required: false
                },
                {
                  key: "researchParticipation",
                  title: "Anonymous Research Participation",
                  description: "Contribute anonymized data to research on cognitive diversity and AI (completely optional)",
                  required: false
                }
              ].map((consent) => (
                <Card key={consent.key} className="akilii-glass border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={consent.key}
                        checked={profile.consentAndPrivacy[consent.key as keyof typeof profile.consentAndPrivacy]}
                        onCheckedChange={(checked) => 
                          updateProfile("consentAndPrivacy", { [consent.key]: checked })
                        }
                        disabled={consent.required}
                      />
                      <div className="flex-1">
                        <Label htmlFor={consent.key} className="font-medium text-white flex items-center gap-2">
                          {consent.title}
                          {consent.required && (
                            <Badge className="text-xs bg-blue-500/20 text-blue-300">Required</Badge>
                          )}
                        </Label>
                        <p className="text-white/70 text-sm mt-1">{consent.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="akilii-glass border-green-400/30">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-white">
                <strong>Security Promise:</strong> All data is encrypted in transit and at rest. 
                We follow industry-leading security practices and never share your personal data 
                without explicit consent. Your cognitive profile is yours alone.
              </AlertDescription>
            </Alert>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 akilii-gradient-primary rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Your NPR Profile is Complete! 🎉
              </h2>
              <p className="text-white/80 leading-relaxed">
                You've successfully created your personalized Neuropsychographic Profile. 
                Your <AkiliiBrand size="sm" inline /> AI companion is now calibrated to understand 
                and adapt to your unique cognitive style.
              </p>
            </div>

            <Card className="akilii-glass border-white/20 text-left">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  What happens next?
                </h3>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Your AI will personalize responses to your learning style
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Support will adapt to your cognitive strengths and needs  
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    You can review and update your profile anytime
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Your data remains private and under your control
                  </li>
                </ul>
              </CardContent>
            </Card>

            <motion.div
              animate={{ 
                y: [-2, 2, -2],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <RobotMascot size="lg" animated={true} variant="celebrating" />
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen akilii-glass-elevated p-6 ${className}`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 akilii-gradient-primary rounded-xl flex items-center justify-center"
                animate={{ rotate: currentStep * 45 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <currentStepData.icon className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">{currentStepData.title}</h1>
                <p className="text-white/70 text-sm">{currentStepData.description}</p>
              </div>
            </div>
            
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-white/60 hover:text-white"
              >
                Skip Assessment
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1 h-2 bg-white/10" />
            <span className="text-white/70 text-sm font-medium">
              {currentStep + 1} / {assessmentSteps.length}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-white/60 hover:text-white disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {assessmentSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep 
                    ? "akilii-gradient-primary w-8" 
                    : index < currentStep 
                    ? "bg-green-400" 
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className="akilii-gradient-primary text-white"
            disabled={
              (currentStep === assessmentSteps.length - 2 && !profile.consentAndPrivacy.dataCollection)
            }
          >
            {currentStep === assessmentSteps.length - 1 ? "Get Started!" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}