import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AkiliiLogo, RobotMascot } from "./AkiliiLogo";
import { 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Heart, 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  MessageCircle, 
  PenTool, 
  Shield, 
  Lightbulb,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  X,
  Rocket,
  Star,
  Wand2,
  Cpu,
  Headphones,
  Eye,
  Timer,
  BookOpen,
  Settings
} from "lucide-react";

interface ExplainerStep {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  mascotVariant?: "waving" | "celebrating" | "thumbsUp";
  bgGradient?: string;
  interactive?: boolean;
  duration?: number;
}

interface ExplainerSequenceProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const explainerSteps: ExplainerStep[] = [
  {
    id: "welcome",
    title: "Welcome to akilii™",
    subtitle: "AI for every unique mind",
    mascotVariant: "waving",
    bgGradient: "from-akilii-purple to-akilii-teal",
    content: (
      <div className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <AkiliiLogo size="2xl" animated={true} showMascot={true} showTagline={true} />
        </motion.div>
        <motion.p
          className="text-lg text-white/90 leading-relaxed max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Your personalized AI assistant designed specifically for neurodivergent minds. 
          Let's explore how AI can transform your learning and working experience.
        </motion.p>
        <motion.div
          className="flex justify-center items-center gap-4 mt-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Badge className="akilii-gradient-primary text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Inclusive Design
          </Badge>
          <Badge className="akilii-gradient-secondary text-white border-0">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </motion.div>
      </div>
    )
  },
  {
    id: "understanding",
    title: "Understanding Neurodiversity",
    subtitle: "Built for every unique mind",
    mascotVariant: "celebrating",
    bgGradient: "from-akilii-pink to-akilii-orange",
    interactive: true,
    duration: 12000, // Extended time for reading detailed explanations
    content: (
      <div className="space-y-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {[
            { 
              icon: Brain, 
              label: "ADHD", 
              color: "from-purple-400 to-pink-500",
              description: "Attention differences with strengths in creativity, spontaneity, and hyperfocus",
              features: ["Custom focus timers", "Break reminders", "Energy-aware scheduling", "Hyperfocus support"]
            },
            { 
              icon: Eye, 
              label: "Dyslexia", 
              color: "from-blue-400 to-teal-500",
              description: "Reading differences with strengths in visual thinking and problem-solving",
              features: ["Text formatting options", "Audio support", "Visual summaries", "Reading assistance"]
            },
            { 
              icon: Heart, 
              label: "Autism", 
              color: "from-green-400 to-blue-500",
              description: "Neurological differences with strengths in detail focus and systematic thinking",
              features: ["Sensory accommodations", "Predictable routines", "Clear communication", "Special interests support"]
            },
            { 
              icon: Zap, 
              label: "Dyspraxia", 
              color: "from-yellow-400 to-orange-500",
              description: "Movement coordination differences with strengths in strategic thinking",
              features: ["Voice input options", "Simplified interfaces", "Motor-friendly design", "Alternative interactions"]
            }
          ].map(({ icon: Icon, label, color, description, features }, index) => (
            <motion.div
              key={label}
              className={`p-5 akilii-glass-premium rounded-2xl border border-white/20 hover:border-white/40 transition-all cursor-pointer group`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -3 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{label}</h4>
              <p className="text-white/80 text-sm leading-relaxed mb-3">{description}</p>
              <div className="space-y-1">
                <p className="text-white/70 text-xs font-medium mb-1">AI Support:</p>
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/50 rounded-full flex-shrink-0"></div>
                    <p className="text-white/60 text-xs">{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          className="text-center space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="akilii-glass-elevated rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-bold text-xl mb-3">Neuropsychography (NPR)</h3>
            <p className="text-white/80 leading-relaxed text-sm mb-4">
              Our innovative NPR system creates a personalized cognitive map that understands how your unique mind works. 
              This isn't about labels or limitations—it's about leveraging your cognitive strengths and providing tailored support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: Brain, label: "Cognitive Patterns", desc: "How you process information" },
                { icon: Target, label: "Learning Preferences", desc: "Your optimal learning style" },
                { icon: Shield, label: "Privacy First", desc: "Your data stays secure & private" }
              ].map(({ icon: Icon, label, desc }, idx) => (
                <div key={idx} className="text-center p-3 akilii-glass rounded-xl border border-white/10">
                  <Icon className="h-6 w-6 text-white mx-auto mb-2" />
                  <p className="text-white font-medium text-xs">{label}</p>
                  <p className="text-white/60 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: "features",
    title: "Your AI-Powered Toolkit",
    subtitle: "Everything you need in one place",
    mascotVariant: "thumbsUp",
    bgGradient: "from-akilii-teal to-akilii-yellow",
    content: (
      <div className="space-y-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {[
            {
              icon: MessageCircle,
              title: "Smart Chat",
              description: "AI conversations that understand context and adapt to your communication style",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: PenTool,
              title: "Planning Tools",
              description: "Visual planning and journaling with cognitive load management",
              color: "from-green-500 to-teal-500"
            },
            {
              icon: Target,
              title: "Goal Tracking",
              description: "Personalized goal setting with NPR-adaptive milestone tracking",
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: Cpu,
              title: "Cognitive Cockpit",
              description: "Real-time adaptation based on your energy and focus levels",
              color: "from-orange-500 to-red-500"
            }
          ].map(({ icon: Icon, title, description, color }, index) => (
            <motion.div
              key={title}
              className="p-4 akilii-glass-elevated rounded-2xl border border-white/10"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">{title}</h4>
              <p className="text-white/70 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  },
  {
    id: "personalization",
    title: "Adaptive Intelligence",
    subtitle: "Technology that learns with you",
    mascotVariant: "celebrating",
    bgGradient: "from-akilii-yellow to-akilii-pink",
    interactive: true,
    content: (
      <div className="space-y-6">
        <motion.div
          className="text-center space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 mx-auto akilii-glass-premium rounded-3xl flex items-center justify-center border-2 border-white/30">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Lightbulb className="h-12 w-12 text-white" />
            </motion.div>
          </div>
          <h3 className="text-xl font-bold text-white">The more you use AI, the smarter it gets</h3>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {[
            { text: "Learns your preferred communication patterns", progress: 85 },
            { text: "Adapts to your optimal focus times", progress: 72 },
            { text: "Customizes interface based on your needs", progress: 94 },
            { text: "Provides relevant suggestions and support", progress: 88 }
          ].map(({ text, progress }, index) => (
            <motion.div
              key={index}
              className="p-3 akilii-glass rounded-lg border border-white/10"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 text-sm">{text}</p>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <motion.div
                className="h-1 bg-white/10 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
              >
                <motion.div
                  className="h-full akilii-gradient-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 1 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  },
  {
    id: "getting-started",
    title: "Ready to Begin?",
    subtitle: "Your personalized journey starts now",
    mascotVariant: "celebrating",
    bgGradient: "from-akilii-purple via-akilii-pink to-akilii-orange",
    content: (
      <div className="space-y-6 text-center">
        <motion.div
          className="space-y-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 mx-auto akilii-glass-premium rounded-full flex items-center justify-center border-2 border-white/30">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Rocket className="h-10 w-10 text-white" />
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-white">You're All Set!</h3>
          <p className="text-white/80 max-w-md mx-auto leading-relaxed">
            AI is now ready to provide you with personalized assistance. 
            Start by exploring your dashboard or having a conversation with your AI assistant.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, staggerChildren: 0.1 }}
        >
          {[
            { icon: MessageCircle, label: "Start Chatting", desc: "Ask questions, get help" },
            { icon: Settings, label: "Customize", desc: "Adapt your experience" },
            { icon: BookOpen, label: "Explore", desc: "Discover all features" }
          ].map(({ icon: Icon, label, desc }, index) => (
            <motion.div
              key={label}
              className="p-4 akilii-glass-elevated rounded-xl border border-white/20 hover:border-white/30 transition-all cursor-pointer"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Icon className="h-8 w-8 text-white mx-auto mb-2" />
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-white/60 text-xs">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
];

export function ExplainerSequence({ isOpen, onClose, onComplete }: ExplainerSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const step = explainerSteps[currentStep];
  const progress = ((currentStep + 1) / explainerSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < explainerSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const skipToEnd = () => {
    setCurrentStep(explainerSteps.length - 1);
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
  };

  // Auto-advance when playing (except for interactive steps)
  useEffect(() => {
    if (isPlaying && !step.interactive && hasStarted) {
      const timer = setTimeout(() => {
        nextStep();
      }, step.duration || 8000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, hasStarted]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          
          {/* Explainer Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 lg:inset-8 z-50 flex items-center justify-center"
          >
            <Card className="w-full max-w-4xl h-full akilii-glass-premium border-2 border-white/30 overflow-hidden">
              {/* Header */}
              <motion.div 
                className={`relative p-6 bg-gradient-to-r ${step.bgGradient} border-b border-white/10`}
                key={step.bgGradient}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      key={step.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <RobotMascot 
                        size="lg" 
                        animated={true} 
                        variant={step.mascotVariant}
                      />
                    </motion.div>
                    <div>
                      <motion.h2 
                        className="text-2xl font-bold text-white"
                        key={step.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        {step.title}
                      </motion.h2>
                      <motion.p 
                        className="text-white/80"
                        key={step.subtitle}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {step.subtitle}
                      </motion.p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:bg-white/10"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipToEnd}
                      className="text-white hover:bg-white/10"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Step {currentStep + 1} of {explainerSteps.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white/30 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <CardContent className="p-8 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full flex items-center justify-center"
                  >
                    {step.content}
                  </motion.div>
                </AnimatePresence>
              </CardContent>

              {/* Footer Controls */}
              <motion.div 
                className="p-6 border-t border-white/10 akilii-glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {!hasStarted ? (
                    <Button
                      onClick={handleStart}
                      className="akilii-gradient-primary text-white border-0 px-8"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Tour
                    </Button>
                  ) : (
                    <Button
                      onClick={currentStep === explainerSteps.length - 1 ? handleComplete : nextStep}
                      className="akilii-gradient-primary text-white border-0 px-8"
                    >
                      {currentStep === explainerSteps.length - 1 ? (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Get Started
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper hook to trigger explainer on first visit
export function useExplainerSequence() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasSeenExplainer = localStorage.getItem("akilii-seen-explainer");
    if (!hasSeenExplainer) {
      setShouldShow(true);
    }
  }, []);

  const markAsSeen = () => {
    localStorage.setItem("akilii-seen-explainer", "true");
    setShouldShow(false);
  };

  const showExplainer = () => {
    setShouldShow(true);
  };

  return {
    shouldShow,
    showExplainer,
    markAsSeen
  };
}