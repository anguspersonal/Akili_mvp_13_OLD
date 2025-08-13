import React from "react";
import { motion } from "motion/react";
import { AnimatedAkiliiLogoAdvanced } from "./AnimatedAkiliiLogo";
import { Button } from "./ui/button";
import { Sparkles, ArrowRight, Brain } from "lucide-react";

interface WelcomeBannerProps {
  onGetStarted: () => void;
}

export function WelcomeBanner({ onGetStarted }: WelcomeBannerProps) {
  return (
    <motion.div 
      className="relative rounded-3xl overflow-hidden border border-border mb-6 welcome-banner-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Simplified Theme-aware background */}
      <div className="absolute inset-0 welcome-banner-bg">
        {/* Light mode background */}
        <div className="light:bg-gradient-to-br light:from-white/95 light:via-gray-50/90 light:to-white/95 absolute inset-0"></div>
        
        {/* Dark mode background */}
        <div className="dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 absolute inset-0"></div>
        
        {/* Darker mode background */}
        <div className="darker:bg-gradient-to-br darker:from-black/98 darker:via-slate-950/95 darker:to-black/98 absolute inset-0"></div>
        
        {/* Subtle brand accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-akilii-pink/5 via-transparent to-akilii-teal/5"></div>
        
        {/* Minimal particle effects */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i * 5)}%`,
                backgroundColor: i % 2 === 0 ? 'var(--akilii-teal)' : 'var(--akilii-pink)',
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 2 + (i * 0.5),
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <AnimatedAkiliiLogoAdvanced 
                size="xl" 
                animated={true} 
                showTagline={false}
                className="mb-4"
              />
            </motion.div>

            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight flex items-center justify-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="akilii-two-tone-text">Welcome Back to</span>
              <AnimatedAkiliiLogoAdvanced size="lg" animated={true} inline={true} className="inline-flex" glowEffect={false} colorCycle={true} interactive={true} />
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-body-two-tone opacity-90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              AI for every unique mind - Your personalized cognitive companion awaits
            </motion.p>
          </div>

          {/* Feature highlights */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              {
                icon: Brain,
                title: "NPR-Adaptive",
                description: "Personalized for your unique cognitive patterns"
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Advanced conversational intelligence"
              },
              {
                icon: ArrowRight,
                title: "Ready to Chat",
                description: "Start your personalized AI conversation"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center p-4 akilii-glass rounded-2xl border border-border backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="w-12 h-12 akilii-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold akilii-two-tone-text mb-2">{feature.title}</h3>
                <p className="text-sm text-body-two-tone opacity-80">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to action */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="akilii-gradient-animated-button text-primary-foreground px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Your AI Conversation
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 akilii-gradient-primary opacity-60" />
    </motion.div>
  );
}