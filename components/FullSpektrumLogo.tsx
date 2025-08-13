import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import fullSpektrumLogo from "figma:asset/2578318f62b94eff505d67b6bc61e79fccbe1dc5.png";

// Hook to get current theme
function useCurrentTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const updateTheme = () => {
      if (document.documentElement.classList.contains('light')) {
        setTheme('light');
      } else if (document.documentElement.classList.contains('darker')) {
        setTheme('darker');
      } else {
        setTheme('dark');
      }
    };

    // Update on mount
    updateTheme();

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

// Get FullSpektrum® colors based on theme
function getFullSpektrumColors(theme: string) {
  const logoColor = '#4ecdc4'; // Main FS logo teal color
  
  return {
    // In light mode, both Full and Spektrum use the same logo color
    // In dark/darker modes, keep existing colors for contrast
    full: theme === 'light' ? logoColor : '#4ecdc4',
    spektrum: theme === 'light' ? logoColor : '#00cec9'
  };
}

interface FullSpektrumLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  showText?: boolean;
}

export function FullSpektrumLogo({ 
  size = 'sm', 
  className = '',
  animated = false,
  showText = false 
}: FullSpektrumLogoProps) {
  const theme = useCurrentTheme();
  const fsColors = getFullSpektrumColors(theme);
  
  const sizeClasses = {
    'xs': 'w-4 h-4',
    'sm': 'w-6 h-6',
    'md': 'w-8 h-8',
    'lg': 'w-12 h-12'
  };

  const textSizeClasses = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg'
  };

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { duration: 0.4, ease: "easeOut" } : undefined}
    >
      {/* Logo Image */}
      <motion.img
        src={fullSpektrumLogo}
        alt="FullSpektrum"
        className={`${sizeClasses[size]} object-contain flex-shrink-0`}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
        whileHover={animated ? { 
          scale: 1.05,
          rotate: 5,
          filter: 'drop-shadow(0 4px 8px rgba(78, 205, 196, 0.3))'
        } : undefined}
        transition={{ duration: 0.2 }}
      />
      
      {/* Optional Text */}
      {showText && (
        <motion.div 
          className={`flex items-center ${textSizeClasses[size]}`}
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { duration: 0.4, delay: 0.2 } : undefined}
        >
          <motion.span 
            className="font-bold tracking-wide"
            style={{ 
              color: fsColors.full,
              textShadow: animated ? `0 0 4px ${fsColors.full}40` : 'none'
            }}
            animate={animated ? { 
              textShadow: [
                `0 0 4px ${fsColors.full}40`,
                `0 0 8px ${fsColors.full}60`,
                `0 0 4px ${fsColors.full}40`
              ]
            } : undefined}
            transition={animated ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            Full
          </motion.span>
          <motion.span 
            className="font-normal tracking-wide"
            style={{ 
              color: fsColors.spektrum,
              textShadow: animated ? `0 0 3px ${fsColors.spektrum}40` : 'none'
            }}
            animate={animated ? { 
              textShadow: [
                `0 0 3px ${fsColors.spektrum}40`,
                `0 0 6px ${fsColors.spektrum}60`,
                `0 0 3px ${fsColors.spektrum}40`
              ]
            } : undefined}
            transition={animated ? { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } : undefined}
          >
            Spektrum®
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Subtle watermark version for footer/branding areas
export function FullSpektrumWatermark({ className = '' }: { className?: string }) {
  const theme = useCurrentTheme();
  const fsColors = getFullSpektrumColors(theme);

  return (
    <motion.div 
      className={`flex items-center gap-1.5 opacity-50 hover:opacity-70 transition-opacity duration-200 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={fullSpektrumLogo}
        alt="FullSpektrum"
        className="w-3 h-3 object-contain"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
      />
      <div className="flex items-center">
        <motion.span 
          className="text-xs font-bold tracking-wide"
          style={{ 
            color: fsColors.full,
            textShadow: `0 0 2px ${fsColors.full}30`
          }}
          animate={{ 
            textShadow: [
              `0 0 2px ${fsColors.full}30`,
              `0 0 4px ${fsColors.full}50`,
              `0 0 2px ${fsColors.full}30`
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          Full
        </motion.span>
        <motion.span 
          className="text-xs font-normal tracking-wide"
          style={{ 
            color: fsColors.spektrum,
            textShadow: `0 0 2px ${fsColors.spektrum}30`
          }}
          animate={{ 
            textShadow: [
              `0 0 2px ${fsColors.spektrum}30`,
              `0 0 4px ${fsColors.spektrum}50`,
              `0 0 2px ${fsColors.spektrum}30`
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          Spektrum®
        </motion.span>
      </div>
    </motion.div>
  );
}