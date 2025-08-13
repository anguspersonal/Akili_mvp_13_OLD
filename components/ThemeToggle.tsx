import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Palette } from 'lucide-react';

type Theme = 'light' | 'dark' | 'darker';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('akilii-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'darker'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark theme
      const defaultTheme: Theme = 'dark';
      setCurrentTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark', 'darker');
    // Add the new theme class
    document.documentElement.classList.add(theme);
    // Save to localStorage
    localStorage.setItem('akilii-theme', theme);
  };

  // Cycle through themes: light → dark → darker → light
  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'darker'];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Get theme config for current theme
  const getThemeConfig = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return {
          icon: Sun,
          label: 'Light Mode',
          color: '#f59e0b', // amber
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          hoverBg: 'hover:bg-amber-200'
        };
      case 'dark':
        return {
          icon: Moon,
          label: 'Dark Mode', 
          color: '#6366f1', // indigo
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-700',
          hoverBg: 'hover:bg-indigo-200'
        };
      case 'darker':
        return {
          icon: Palette,
          label: 'Darker Mode',
          color: '#a855f7', // purple
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          hoverBg: 'hover:bg-purple-200'
        };
    }
  };

  const currentConfig = getThemeConfig(currentTheme);
  const CurrentIcon = currentConfig.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      buttonSize: 'w-8 h-8',
      iconSize: 'h-4 w-4',
      fontSize: 'text-xs'
    },
    md: {
      buttonSize: 'w-10 h-10',
      iconSize: 'h-5 w-5',
      fontSize: 'text-sm'
    },
    lg: {
      buttonSize: 'w-12 h-12', 
      iconSize: 'h-6 w-6',
      fontSize: 'text-base'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        onClick={cycleTheme}
        className={`
          ${config.buttonSize} 
          rounded-xl 
          flex items-center justify-center 
          transition-all duration-300 
          border border-white/20 
          backdrop-blur-sm
          ${currentConfig.bgColor}
          ${currentConfig.hoverBg}
          hover:scale-105 
          active:scale-95
          shadow-lg
        `}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        title={`Switch to ${getThemeConfig(
          currentTheme === 'light' ? 'dark' : 
          currentTheme === 'dark' ? 'darker' : 'light'
        ).label}`}
      >
        <motion.div
          key={currentTheme}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15 
          }}
        >
          <CurrentIcon 
            className={`${config.iconSize} ${currentConfig.textColor}`}
            style={{ color: currentConfig.color }}
          />
        </motion.div>
      </motion.button>

      {showLabel && (
        <motion.span 
          key={currentTheme}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`${config.fontSize} font-medium ${currentConfig.textColor}`}
          style={{ color: currentConfig.color }}
        >
          {currentConfig.label}
        </motion.span>
      )}
    </div>
  );
}

// Hook to get current theme
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('akilii-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'darker'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const htmlClasses = document.documentElement.classList;
      if (htmlClasses.contains('light')) {
        setCurrentTheme('light');
      } else if (htmlClasses.contains('darker')) {
        setCurrentTheme('darker');
      } else {
        setCurrentTheme('dark');
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return currentTheme;
}

export default ThemeToggle;