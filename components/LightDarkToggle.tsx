import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

type Theme = 'light' | 'dark' | 'darker';

interface LightDarkToggleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function LightDarkToggle({ 
  size = 'md', 
  className = '',
  showLabel = false 
}: LightDarkToggleProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const storedTheme = localStorage.getItem('akilii-theme');
    const validThemes: Theme[] = ['light', 'dark', 'darker'];
    
    if (storedTheme && validThemes.includes(storedTheme as Theme)) {
      setCurrentTheme(storedTheme as Theme);
      applyTheme(storedTheme as Theme);
    } else {
      // Default to dark theme
      setCurrentTheme('dark');
      applyTheme('dark');
      localStorage.setItem('akilii-theme', 'dark');
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'darker');
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem('akilii-theme', theme);
  };

  const cycleTheme = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Cycle through: light → dark → darker → light
    const themeOrder: Theme[] = ['light', 'dark', 'darker'];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme);
    
    // Show theme change notification
    const themeLabels = {
      light: 'Light Mode ☀️',
      dark: 'Dark Mode 🌙',
      darker: 'Darker Mode ⚫'
    };
    
    toast.success(`Switched to ${themeLabels[nextTheme]}`, {
      description: `akilii™ interface updated with ${nextTheme} theme`,
      duration: 2000
    });
    
    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun className={`${getIconSize()} text-yellow-500`} />;
      case 'dark':
        return <Moon className={`${getIconSize()} text-blue-400`} />;
      case 'darker':
        return <Circle className={`${getIconSize()} text-purple-400 fill-current`} />;
      default:
        return <Moon className={`${getIconSize()} text-blue-400`} />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-10 w-10';
      default:
        return 'h-8 w-8';
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'darker':
        return 'Darker';
      default:
        return 'Dark';
    }
  };

  const getThemeColor = () => {
    switch (currentTheme) {
      case 'light':
        return 'akilii-gradient-accent';
      case 'dark':
        return 'akilii-gradient-primary';
      case 'darker':
        return 'akilii-gradient-secondary';
      default:
        return 'akilii-gradient-primary';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Theme Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isTransitioning ? { 
          rotate: [0, 180, 360],
          scale: [1, 0.9, 1]
        } : {}}
        transition={{ 
          duration: isTransitioning ? 0.6 : 0.2,
          ease: "easeInOut"
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleTheme}
          disabled={isTransitioning}
          className={`
            ${getButtonSize()} p-0 rounded-lg
            akilii-glass border border-border
            hover:akilii-glass-elevated
            transition-all duration-200
            relative overflow-hidden
          `}
          aria-label={`Switch to next theme (currently ${currentTheme})`}
        >
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: currentTheme === 'light' 
                ? "radial-gradient(circle, rgba(255, 230, 109, 0.2) 0%, transparent 70%)"
                : currentTheme === 'dark'
                ? "radial-gradient(circle, rgba(116, 185, 255, 0.2) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(168, 230, 207, 0.2) 0%, transparent 70%)"
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Icon with smooth transition */}
          <motion.div
            key={currentTheme}
            initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10"
          >
            {getThemeIcon()}
          </motion.div>
        </Button>
      </motion.div>

      {/* Theme Label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={currentTheme}
          transition={{ duration: 0.3 }}
        >
          <Badge 
            className={`
              text-xs px-2 py-1 border-0 text-primary-foreground
              ${getThemeColor()}
            `}
          >
            {getThemeLabel()}
          </Badge>
        </motion.div>
      )}
    </div>
  );
}

// Compact version for use in tight spaces
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('akilii-theme');
    const validThemes: Theme[] = ['light', 'dark', 'darker'];
    
    if (storedTheme && validThemes.includes(storedTheme as Theme)) {
      setCurrentTheme(storedTheme as Theme);
    }
  }, []);

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'darker'];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    setCurrentTheme(nextTheme);
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'darker');
    root.classList.add(nextTheme);
    localStorage.setItem('akilii-theme', nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className={`h-6 w-6 p-0 rounded-md hover:akilii-glass transition-all ${className}`}
      aria-label={`Current theme: ${currentTheme}`}
    >
      {currentTheme === 'light' && <Sun className="h-3 w-3 text-yellow-500" />}
      {currentTheme === 'dark' && <Moon className="h-3 w-3 text-blue-400" />}
      {currentTheme === 'darker' && <Circle className="h-3 w-3 text-purple-400 fill-current" />}
    </Button>
  );
}

// Theme indicator for status displays
export function ThemeIndicator({ className = '' }: { className?: string }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('akilii-theme');
    const validThemes: Theme[] = ['light', 'dark', 'darker'];
    
    if (storedTheme && validThemes.includes(storedTheme as Theme)) {
      setCurrentTheme(storedTheme as Theme);
    }

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      if (root.classList.contains('light')) setCurrentTheme('light');
      else if (root.classList.contains('darker')) setCurrentTheme('darker');
      else setCurrentTheme('dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const getThemeDisplay = () => {
    switch (currentTheme) {
      case 'light':
        return { icon: <Sun className="h-3 w-3" />, label: 'Light', color: 'text-yellow-600' };
      case 'dark':
        return { icon: <Moon className="h-3 w-3" />, label: 'Dark', color: 'text-blue-400' };
      case 'darker':
        return { icon: <Circle className="h-3 w-3 fill-current" />, label: 'Darker', color: 'text-purple-400' };
      default:
        return { icon: <Moon className="h-3 w-3" />, label: 'Dark', color: 'text-blue-400' };
    }
  };

  const theme = getThemeDisplay();

  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <span className={theme.color}>
        {theme.icon}
      </span>
      <span>{theme.label} Mode</span>
    </div>
  );
}

export default LightDarkToggle;