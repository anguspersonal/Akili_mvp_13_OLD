import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedAkiliiLogoAdvanced } from "./AnimatedAkiliiLogo";
import { Footer, CompactFooter } from "./Footer";
import { Brain, Sparkles, Stars, Rocket, CircuitBoard, Cpu } from "lucide-react";

export function LoadingScreen() {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingStages = [
    { message: "Initializing akilii™ systems", icon: CircuitBoard },
    { message: "Calibrating neural pathways", icon: Brain },
    { message: "Optimizing cognitive interface", icon: Cpu },
    { message: "Preparing your workspace", icon: Sparkles },
    { message: "Welcome to your journey", icon: Rocket }
  ];

  useEffect(() => {
    const stages = [
      { delay: 0, stage: 0, progress: 0 },
      { delay: 300, stage: 0, progress: 20 },
      { delay: 600, stage: 1, progress: 40 },
      { delay: 900, stage: 2, progress: 60 },
      { delay: 1200, stage: 3, progress: 80 },
      { delay: 1400, stage: 4, progress: 100 }
    ];

    stages.forEach(({ delay, stage, progress: newProgress }) => {
      setTimeout(() => {
        setLoadingStage(stage);
        setProgress(newProgress);
      }, delay);
    });
  }, []);

  const CurrentIcon = loadingStages[loadingStage]?.icon || Brain;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dynamic Background with Particles */}
      <div className="absolute inset-0">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 akilii-gradient-mesh opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, #ff6b9d 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4ecdc4 0%, transparent 50%), radial-gradient(circle at 40% 40%, #ffe66d 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #ff6b9d 0%, transparent 50%), radial-gradient(circle at 20% 80%, #4ecdc4 0%, transparent 50%), radial-gradient(circle at 60% 60%, #ffe66d 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, #ff6b9d 0%, transparent 50%), radial-gradient(circle at 60% 40%, #4ecdc4 0%, transparent 50%), radial-gradient(circle at 80% 80%, #ffe66d 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 akilii-gradient-primary rounded-full opacity-60"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 md:p-8 pb-24 md:pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center w-full max-w-lg mx-auto"
        >
          {/* Animated Glass Card */}
          <motion.div
            className="akilii-glass-premium rounded-4xl p-6 md:p-12 border border-white/30 relative overflow-hidden"
            animate={{
              boxShadow: [
                "0 32px 64px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                "0 40px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                "0 32px 64px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
                  "linear-gradient(225deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Animated Logo - Identical to AuthFlow */}
            <motion.div 
              className="mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <AnimatedAkiliiLogoAdvanced 
                size="xl" 
                animated={true} 
                showTagline={true}
                showMascot={true}
                variant="premium"
                className="mb-4"
              />
            </motion.div>

            {/* Dynamic Loading Message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={loadingStage}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mb-6 md:mb-8"
              >
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 md:w-12 md:h-12 akilii-gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <CurrentIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 text-truncate">
                      {loadingStages[loadingStage]?.message || "Loading..."}
                    </h3>
                    <p className="text-white/60 text-sm text-truncate">
                      Building your personalized AI experience
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Enhanced Progress Bar */}
            <div className="space-y-4">
              <div className="relative w-full h-3 akilii-glass rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-0 akilii-gradient-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                
                {/* Progress Shimmer */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-80, 320] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </div>

              {/* Progress Text */}
              <motion.div 
                className="flex justify-between items-center text-sm text-white/70"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-truncate">Initializing...</span>
                <span className="font-bold flex-shrink-0">{progress}%</span>
              </motion.div>
            </div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-6 md:mt-8 flex justify-center gap-4 md:gap-6"
            >
              {[
                { icon: Brain, label: "NPR-Adaptive", color: "from-pink-400 to-purple-500" },
                { icon: Sparkles, label: "AI-Powered", color: "from-teal-400 to-blue-500" },
                { icon: Stars, label: "Personalized", color: "from-yellow-400 to-orange-500" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.2, duration: 0.4 }}
                  className="text-center flex-1 min-w-0"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}
                  >
                    <feature.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </motion.div>
                  <span className="text-xs text-white/60 font-medium text-truncate block">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Loading Dots */}
            <motion.div 
              className="flex justify-center gap-2 mt-4 md:mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-white/40 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* FS Logo Footer - Fixed Position */}
      <motion.div 
        className="fixed bottom-4 left-0 right-0 z-20 pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex justify-center pointer-events-auto">
          <CompactFooter />
        </div>
      </motion.div>
    </div>
  );
}