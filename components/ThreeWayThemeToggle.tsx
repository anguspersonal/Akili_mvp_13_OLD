import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Sun, Moon, MoonIcon } from 'lucide-react';

interface ThreeWayThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThreeWayThemeToggle({ 
  size = 'md', 
  showLabel = true, 
  className = '' 
}: ThreeWayThemeToggleProps) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'darker'>('dark');

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 w-8 p-0',
      icon: 'h-3 w-3',
      text: 'text-xs',
      container: 'gap-1'
    },
    md: {
      button: 'h-9 w-9 p-0',
      icon: 'h-4 w-4',
      text: 'text-sm',
      container: 'gap-2'
    },
    lg: {
      button: 'h-10 w-10 p-0',
      icon: 'h-5 w-5',
      text: 'text-base',
      container: 'gap-2'
    }
  };

  const config = sizeConfig[size];

  // Initialize theme from document classes
  useEffect(() => {
    const detectTheme = () => {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        setCurrentTheme('light');
      } else if (html.classList.contains('darker')) {
        setCurrentTheme('darker');
      } else {
        setCurrentTheme('dark');
      }
    };

    detectTheme();

    // Listen for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Cycle to next theme
  const cycleTheme = () => {
    const html = document.documentElement;
    let nextTheme: 'light' | 'dark' | 'darker';

    switch (currentTheme) {
      case 'light':
        nextTheme = 'dark';
        html.classList.remove('light', 'darker');
        html.classList.add('dark');
        break;
      case 'dark':
        nextTheme = 'darker';
        html.classList.remove('light', 'dark');
        html.classList.add('darker');
        break;
      case 'darker':
        nextTheme = 'light';
        html.classList.remove('dark', 'darker');
        html.classList.add('light');
        break;
      default:
        nextTheme = 'dark';
        html.classList.remove('light', 'darker');
        html.classList.add('dark');
    }

    setCurrentTheme(nextTheme);

    // Store preference
    try {
      localStorage.setItem('theme-preference', nextTheme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  };

  // Get theme info for display
  const getThemeInfo = (theme: 'light' | 'dark' | 'darker') => {
    switch (theme) {
      case 'light':
        return {
          name: 'Light',
          icon: Sun,
          gradient: 'akilii-gradient-animated-button',
          description: 'Switch to Dark Mode'
        };
      case 'dark':
        return {
          name: 'Dark',
          icon: Moon,
          gradient: 'akilii-gradient-animated-button',
          description: 'Switch to Darker Mode'
        };
      case 'darker':
        return {
          name: 'Darker',
          icon: MoonIcon,
          gradient: 'akilii-gradient-animated-button',
          description: 'Switch to Light Mode'
        };
    }
  };

  const themeInfo = getThemeInfo(currentTheme);
  const IconComponent = themeInfo.icon;

  return (
    <div className={`flex items-center ${config.container} ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleTheme}
          className={`${config.button} ${themeInfo.gradient} relative overflow-hidden group`}
          title={themeInfo.description}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTheme}
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut",
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="flex items-center justify-center"
            >
              <IconComponent className={`${config.icon} text-white relative z-10`} />
            </motion.div>
          </AnimatePresence>
          
          {/* Enhanced gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          />
        </Button>
      </motion.div>

      {showLabel && (
        <motion.span
          key={`${currentTheme}-label`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className={`${config.text} font-medium akilii-gradient-text-fast select-none`}
        >
          {themeInfo.name}
        </motion.span>
      )}

      {/* Theme indicator dots */}
      <div className="flex items-center gap-1 ml-2">
        {(['light', 'dark', 'darker'] as const).map((theme) => (
          <motion.div
            key={theme}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              currentTheme === theme 
                ? 'akilii-gradient-primary shadow-lg' 
                : 'bg-muted-foreground/30'
            }`}
            animate={currentTheme === theme ? {
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
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
  );
}

export default ThreeWayThemeToggle;