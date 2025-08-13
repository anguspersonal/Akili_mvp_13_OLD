import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AnimatedAkiliiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  animated?: boolean;
  inline?: boolean;
  className?: string;
  glowEffect?: boolean;
  interactive?: boolean;
}

export function AnimatedAkiliiLogo({
  size = 'md',
  animated = true,
  inline = false,
  className = '',
  glowEffect = false,
  interactive = false
}: AnimatedAkiliiLogoProps) {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'darker'>('dark');

  // Theme-specific brand colors for 'kili' cycling
  const getKiliColors = (theme: 'light' | 'dark' | 'darker') => {
    switch (theme) {
      case 'light':
        // Darker versions of brand colors for light mode visibility
        return [
          '#059669', // Darker teal
          '#d97706', // Darker yellow/orange
          '#dc2626'  // Darker orange/red
        ];
      case 'dark':
        // Standard brand colors for dark mode
        return [
          '#4ecdc4', // akilii teal
          '#ffe66d', // akilii yellow  
          '#ff8c42'  // akilii orange
        ];
      case 'darker':
      default:
        // Slightly brighter versions for darker mode
        return [
          '#5dd5cc', // Slightly brighter teal
          '#ffeb75', // Slightly brighter yellow
          '#ff9352'  // Slightly brighter orange
        ];
    }
  };

  // Theme-adaptive colors for static 'a' and final 'i' letters (AI embellishment)
  const getStaticColor = (theme: 'light' | 'dark' | 'darker') => {
    switch (theme) {
      case 'light':
        return '#2d4a47';  // Dark greyish teal for light backgrounds
      case 'dark':
      case 'darker':
        return '#ffffff';  // Pure white for dark/darker backgrounds
      default:
        return '#ffffff';
    }
  };

  // Detect current theme
  useEffect(() => {
    const detectTheme = () => {
      const htmlElement = document.documentElement;
      if (htmlElement.classList.contains('light')) {
        setCurrentTheme('light');
      } else if (htmlElement.classList.contains('darker')) {
        setCurrentTheme('darker');
      } else {
        setCurrentTheme('dark');
      }
    };

    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Get current theme's colors
  const kiliColors = getKiliColors(currentTheme);
  const staticColor = getStaticColor(currentTheme);
  const trademarkColor = '#a8e6cf'; // Always mint green

  // Color cycling effect for 'kili' letters only
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setCurrentColorIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % kiliColors.length;
        return newIndex;
      });
    }, 2000); // 2 second cycle

    return () => clearInterval(interval);
  }, [animated, kiliColors.length, currentTheme]);

  // Size configuration
  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'xs':
        return { fontSize: 'text-sm', spacing: '0.02em', trademark: 'text-[0.65rem]' };
      case 'sm':
        return { fontSize: 'text-base', spacing: '0.02em', trademark: 'text-[0.75rem]' };
      case 'md':
        return { fontSize: 'text-xl', spacing: '0.02em', trademark: 'text-sm' };
      case 'lg':
        return { fontSize: 'text-2xl', spacing: '0.02em', trademark: 'text-base' };
      case 'xl':
        return { fontSize: 'text-3xl', spacing: '0.02em', trademark: 'text-lg' };
      case '2xl':
        return { fontSize: 'text-4xl', spacing: '0.02em', trademark: 'text-xl' };
      case '3xl':
        return { fontSize: 'text-5xl', spacing: '0.02em', trademark: 'text-2xl' };
      case '4xl':
        return { fontSize: 'text-6xl', spacing: '0.02em', trademark: 'text-3xl' };
      default:
        return { fontSize: 'text-xl', spacing: '0.02em', trademark: 'text-sm' };
    }
  };

  const config = getSizeConfig(size);

  // Get color for each kili letter with cycling
  const getKiliLetterColor = (letterIndex: number) => {
    const colorIndex = (currentColorIndex + letterIndex) % kiliColors.length;
    return kiliColors[colorIndex];
  };

  const containerClass = inline 
    ? `inline-flex items-baseline justify-center ${className}`
    : `flex items-baseline justify-center ${className}`;

  return (
    <motion.div
      key={`logo-${currentTheme}`}
      className={containerClass}
      style={{ gap: config.spacing }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`${config.fontSize} font-black flex items-baseline`}
        style={{ 
          letterSpacing: config.spacing,
          gap: config.spacing
        }}
      >
        {/* Static 'a' - Dark Teal in light mode, White in dark modes (AI embellishment) */}
        <motion.span
          key={`a-${currentTheme}`}
          className="font-black select-none"
          style={{ 
            color: staticColor,
            display: 'inline-block',
            textShadow: glowEffect ? `0 0 8px ${staticColor}40` : 'none'
          }}
          whileHover={interactive ? { scale: 1.1, y: -2, transition: { duration: 0.2 } } : {}}
        >
          a
        </motion.span>
        
        {/* Animated 'k' - First letter of kili */}
        <motion.span
          key={`k-${currentColorIndex}-${currentTheme}`}
          className="font-black select-none"
          style={{ 
            color: getKiliLetterColor(0),
            display: 'inline-block',
            textShadow: glowEffect ? `0 0 8px ${getKiliLetterColor(0)}40` : 'none'
          }}
          animate={animated ? {
            scale: [1, 1.05, 1],
            y: [0, -1, 0],
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
          whileHover={interactive ? { scale: 1.1, y: -2, transition: { duration: 0.2 } } : {}}
        >
          k
        </motion.span>

        {/* Animated 'i' - Second letter of kili */}
        <motion.span
          key={`i1-${currentColorIndex}-${currentTheme}`}
          className="font-black select-none"
          style={{ 
            color: getKiliLetterColor(1),
            display: 'inline-block',
            textShadow: glowEffect ? `0 0 8px ${getKiliLetterColor(1)}40` : 'none'
          }}
          animate={animated ? {
            scale: [1, 1.05, 1],
            y: [0, -1, 0],
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1,
          }}
          whileHover={interactive ? { scale: 1.1, y: -2, transition: { duration: 0.2 } } : {}}
        >
          i
        </motion.span>

        {/* Animated 'l' - Third letter of kili */}
        <motion.span
          key={`l-${currentColorIndex}-${currentTheme}`}
          className="font-black select-none"
          style={{ 
            color: getKiliLetterColor(2),
            display: 'inline-block',
            textShadow: glowEffect ? `0 0 8px ${getKiliLetterColor(2)}40` : 'none'
          }}
          animate={animated ? {
            scale: [1, 1.05, 1],
            y: [0, -1, 0],
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          whileHover={interactive ? { scale: 1.1, y: -2, transition: { duration: 0.2 } } : {}}
        >
          l
        </motion.span>

        {/* Animated 'i' - Fourth letter of kili */}
        <motion.span
          key={`i2-${currentColorIndex}-${currentTheme}`}
          className="font-black select-none"
          style={{ 
            color: getKiliLetterColor(0), // Matches first letter for pattern consistency
            display: 'inline-block',
            textShadow: glowEffect ? `0 0 8px ${getKiliLetterColor(0)}40` : 'none'
          }}
          animate={animated ? {
            scale: [1, 1.05, 1],
            y: [0, -1, 0],
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          whileHover={interactive ? { scale: 1.1, y: -2, transition: { duration: 0.2 } } : {}}
        >
          i
        </motion.span>

        {/* Static final 'i' - Dark Teal in light mode, White in dark modes (AI embellishment) */}
        <motion.span
          key={`final-i-${currentTheme}`}
          className="font-black select-none"
          style={{ 
            color: staticColor,
            display: 'inline-block',
            textShadow: glowEffect ? `0 0 8px ${staticColor}40` : 'none'
          }}
          whileHover={interactive ? { scale: 1.1, y: -2, transition: { duration: 0.2 } } : {}}
        >
          i
        </motion.span>

        {/* Trademark symbol - Mint green */}
        <motion.span
          key={`trademark-${currentTheme}`}
          className={`${config.trademark} font-normal select-none relative ml-1`}
          style={{ 
            color: trademarkColor,
            textShadow: glowEffect ? `0 0 6px ${trademarkColor}50` : 'none'
          }}
          animate={animated ? {
            scale: [1, 1.02, 1],
            opacity: [0.9, 1, 0.9],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          whileHover={interactive ? { scale: 1.1, transition: { duration: 0.2 } } : {}}
        >
          ™
        </motion.span>
      </div>

      {/* Optional glow effect */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={animated ? {
            background: [
              `radial-gradient(circle, ${getKiliLetterColor(0)}10 0%, transparent 70%)`,
              `radial-gradient(circle, ${getKiliLetterColor(1)}10 0%, transparent 70%)`,
              `radial-gradient(circle, ${trademarkColor}10 0%, transparent 70%)`,
            ]
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}

// Simple text fallback for cases where animation isn't needed
export function AkiliiTextFallback({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'darker'>('dark');

  useEffect(() => {
    const detectTheme = () => {
      const htmlElement = document.documentElement;
      if (htmlElement.classList.contains('light')) {
        setCurrentTheme('light');
      } else if (htmlElement.classList.contains('darker')) {
        setCurrentTheme('darker');
      } else {
        setCurrentTheme('dark');
      }
    };

    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const sizeMap = {
    'xs': 'text-sm', 'sm': 'text-base', 'md': 'text-xl', 'lg': 'text-2xl',
    'xl': 'text-3xl', '2xl': 'text-4xl', '3xl': 'text-5xl', '4xl': 'text-6xl'
  };

  // Theme-specific static color
  const getStaticColor = (theme: 'light' | 'dark' | 'darker') => {
    switch (theme) {
      case 'light': return '#2d4a47';
      case 'dark':
      case 'darker': return '#ffffff';
      default: return '#ffffff';
    }
  };

  // Theme-specific 'kili' colors
  const getKiliColors = (theme: 'light' | 'dark' | 'darker') => {
    switch (theme) {
      case 'light':
        return ['#059669', '#d97706', '#dc2626'];
      case 'dark':
        return ['#4ecdc4', '#ffe66d', '#ff8c42'];
      case 'darker':
      default:
        return ['#5dd5cc', '#ffeb75', '#ff9352'];
    }
  };

  const staticColor = getStaticColor(currentTheme);
  const kiliColors = getKiliColors(currentTheme);

  return (
    <span className={`${sizeMap[size]} font-black ${className}`}>
      <span style={{ color: staticColor }}>a</span>
      <span style={{ color: kiliColors[0] }}>k</span>
      <span style={{ color: kiliColors[1] }}>i</span>
      <span style={{ color: kiliColors[2] }}>l</span>
      <span style={{ color: kiliColors[0] }}>i</span>
      <span style={{ color: staticColor }}>i</span>
      <span style={{ color: '#a8e6cf' }}>™</span>
    </span>
  );
}

export default AnimatedAkiliiLogo;