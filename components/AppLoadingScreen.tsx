import React from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';
import { AnimatedAkiliiLogo } from './AnimatedAkiliiLogo';
import { PremiumBackgroundElements } from './PremiumBackgroundElements';

export function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <PremiumBackgroundElements />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        {/* Enhanced loading animation */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 akilii-gradient-animated-button rounded-full mx-auto mb-8 flex items-center justify-center relative"
          >
            <Brain className="h-10 w-10 text-primary-foreground" />
            
            {/* Orbital rings */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-primary/30 rounded-full"
              style={{ margin: '-4px' }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-primary/20 rounded-full"
              style={{ margin: '-8px' }}
            />
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatedAkiliiLogo size="xl" animated={true} />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6"
        >
          <p className="akilii-two-tone-text-subtle text-lg mb-2">
            Initializing your cognitive companion...
          </p>
          
          {/* Premium loading progress */}
          <div className="w-64 h-1 bg-muted/30 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full akilii-gradient-animated-button"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}