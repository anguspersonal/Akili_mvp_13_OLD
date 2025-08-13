import React from 'react';
import { motion } from 'motion/react';

// Enhanced Animated Badge Component
export function EnhancedAnimatedBadge({ 
  children, 
  className = "", 
  variant = "default",
  animated = true,
  pulseSpeed = "normal"
}: { 
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error" | "info" | "premium";
  animated?: boolean;
  pulseSpeed?: "slow" | "normal" | "fast";
}) {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'premium':
        return 'akilii-gradient-primary text-white border-0';
      default:
        return 'akilii-glass text-foreground border-border';
    }
  };

  const getPulseDuration = (speed: string) => {
    switch (speed) {
      case 'slow': return 4;
      case 'fast': return 1.5;
      default: return 2.5;
    }
  };

  return (
    <motion.div
      className={`text-xs px-2 py-1 rounded-lg border backdrop-blur-sm relative overflow-hidden ${getVariantStyles(variant)} ${className}`}
      whileHover={animated ? { 
        scale: 1.05, 
        y: -2,
        boxShadow: variant === 'premium' 
          ? '0 8px 25px rgba(168, 230, 207, 0.4)' 
          : '0 4px 15px rgba(168, 230, 207, 0.2)'
      } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
      animate={animated ? {
        boxShadow: variant === 'premium' ? [
          '0 4px 15px rgba(168, 230, 207, 0.3)',
          '0 8px 25px rgba(255, 107, 157, 0.4)',
          '0 4px 15px rgba(168, 230, 207, 0.3)',
        ] : [
          '0 0 0 rgba(168, 230, 207, 0)',
          '0 0 10px rgba(168, 230, 207, 0.3)',
          '0 0 0 rgba(168, 230, 207, 0)',
        ]
      } : {}}
      transition={animated ? { 
        duration: getPulseDuration(pulseSpeed), 
        repeat: Infinity, 
        ease: "easeInOut" 
      } : {}}
    >
      {variant === 'premium' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
}