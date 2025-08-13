import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AkiliiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  inline?: boolean;
  className?: string;
  interactive?: boolean;
}

// Simple theme detection hook
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

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

export function RobotMascot({ 
  size = 'md', 
  animated = true,
  className = ''
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}) {
  const theme = useCurrentTheme();

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'xs': return 'w-6 h-6';
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-12 h-12';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-20 h-20';
      default: return 'w-12 h-12';
    }
  };

  const getColors = (theme: string) => {
    switch (theme) {
      case 'light':
        return {
          primary: '#4ecdc4',
          secondary: '#ff6b9d',
          accent: '#ffe66d'
        };
      case 'darker':
        return {
          primary: '#a8e6cf',
          secondary: '#ff6b9d',
          accent: '#74b9ff'
        };
      default:
        return {
          primary: '#4ecdc4',
          secondary: '#ff6b9d',
          accent: '#ffe66d'
        };
    }
  };

  const colors = getColors(theme);

  return (
    <motion.div
      className={`${getSizeClasses(size)} relative ${className}`}
      animate={animated ? {
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={animated ? {
        scale: 1.1,
        rotate: 5,
      } : {}}
    >
      {/* Robot SVG with enhanced animations */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
      >
        {/* Robot Head */}
        <motion.circle
          cx="50"
          cy="35"
          r="18"
          fill={colors.primary}
          animate={animated ? {
            fill: [colors.primary, colors.secondary, colors.primary],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Robot Eyes */}
        <motion.circle
          cx="44"
          cy="32"
          r="3"
          fill="white"
          animate={animated ? {
            scale: [1, 0.8, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.circle
          cx="56"
          cy="32"
          r="3"
          fill="white"
          animate={animated ? {
            scale: [1, 0.8, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1
          }}
        />
        
        {/* Robot Pupils */}
        <motion.circle
          cx="44"
          cy="32"
          r="1.5"
          fill={colors.secondary}
          animate={animated ? {
            x: [0, 1, -1, 0],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.circle
          cx="56"
          cy="32"
          r="1.5"
          fill={colors.secondary}
          animate={animated ? {
            x: [0, 1, -1, 0],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Robot Mouth */}
        <motion.rect
          x="46"
          y="38"
          width="8"
          height="2"
          rx="1"
          fill={colors.accent}
          animate={animated ? {
            width: [8, 10, 8],
            x: [46, 45, 46],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Robot Body */}
        <motion.rect
          x="35"
          y="50"
          width="30"
          height="25"
          rx="5"
          fill={colors.primary}
          animate={animated ? {
            fill: [colors.primary, colors.secondary, colors.primary],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Robot Chest Panel */}
        <motion.rect
          x="42"
          y="55"
          width="16"
          height="12"
          rx="2"
          fill={colors.accent}
          animate={animated ? {
            fill: [colors.accent, colors.secondary, colors.accent],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Robot Arms */}
        <motion.circle
          cx="28"
          cy="58"
          r="4"
          fill={colors.secondary}
          animate={animated ? {
            y: [0, -2, 0],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
        <motion.circle
          cx="72"
          cy="58"
          r="4"
          fill={colors.secondary}
          animate={animated ? {
            y: [0, -2, 0],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7
          }}
        />
        
        {/* Robot Legs */}
        <motion.rect
          x="42"
          y="75"
          width="6"
          height="12"
          rx="3"
          fill={colors.primary}
          animate={animated ? {
            height: [12, 14, 12],
            y: [75, 74, 75],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        <motion.rect
          x="52"
          y="75"
          width="6"
          height="12"
          rx="3"
          fill={colors.primary}
          animate={animated ? {
            height: [12, 14, 12],
            y: [75, 74, 75],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6
          }}
        />
        
        {/* Robot Antenna */}
        <motion.line
          x1="50"
          y1="17"
          x2="50"
          y2="12"
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
          animate={animated ? {
            y1: [17, 15, 17],
            y2: [12, 10, 12],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.circle
          cx="50"
          cy="10"
          r="2"
          fill={colors.accent}
          animate={animated ? {
            scale: [1, 1.3, 1],
            fill: [colors.accent, colors.secondary, colors.accent],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </motion.div>
  );
}

export function AkiliiLogo({
  size = 'md',
  animated = false,
  inline = false,
  className = '',
  interactive = true
}: AkiliiLogoProps) {
  const [isHovering, setIsHovering] = useState(false);
  const theme = useCurrentTheme();

  // Size configuration
  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'xs':
        return {
          fontSize: 'text-xs',
          spacing: 'gap-0.5',
          container: 'h-4',
          trademark: 'text-[0.5rem]'
        };
      case 'sm':
        return {
          fontSize: 'text-sm',
          spacing: 'gap-0.5',
          container: 'h-5',
          trademark: 'text-[0.6rem]'
        };
      case 'md':
        return {
          fontSize: 'text-lg',
          spacing: 'gap-1',
          container: 'h-6',
          trademark: 'text-xs'
        };
      case 'lg':
        return {
          fontSize: 'text-xl',
          spacing: 'gap-1',
          container: 'h-8',
          trademark: 'text-sm'
        };
      case 'xl':
        return {
          fontSize: 'text-2xl',
          spacing: 'gap-1.5',
          container: 'h-10',
          trademark: 'text-base'
        };
      case '2xl':
        return {
          fontSize: 'text-3xl',
          spacing: 'gap-2',
          container: 'h-12',
          trademark: 'text-lg'
        };
      default:
        return {
          fontSize: 'text-lg',
          spacing: 'gap-1',
          container: 'h-6',
          trademark: 'text-xs'
        };
    }
  };

  const config = getSizeConfig(size);

  // Brand colors following guidelines
  const getThemeAdaptiveColors = (theme: string) => {
    if (theme === 'light') {
      return {
        a: '#6b8a89',     // Light greyish teal for 'a' and 'i' letters in light mode
        k: '#4ecdc4',     // Keep teal
        i1: '#6b8a89',    // Light greyish teal for 'i' letters in light mode
        l: '#ff8c42',     // Keep orange
        i2: '#6b8a89',    // Light greyish teal for 'i' letters in light mode
        i3: '#4ecdc4',    // Keep teal
        trademark: '#a8e6cf' // Keep mint green
      };
    }
    return {
      a: '#ff6b9d',     // Pink
      k: '#4ecdc4',     // Teal
      i1: '#ffe66d',    // Yellow
      l: '#ff8c42',     // Orange
      i2: '#ff6b9d',    // Pink (same as 'a')
      i3: '#4ecdc4',    // Teal (cycling back)
      trademark: '#a8e6cf' // Mint green
    };
  };

  const colors = getThemeAdaptiveColors(theme);

  // Simple animation variants
  const letterVariants = {
    initial: { scale: 1, y: 0 },
    animate: {
      scale: [1, 1.05, 1],
      y: [0, -1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.1,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  const containerClass = inline 
    ? `inline-flex items-center ${config.spacing} relative ${className}`
    : `flex items-center ${config.spacing} ${config.container} relative ${className}`;

  return (
    <motion.div
      className={containerClass}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <div className={`${config.fontSize} font-black flex items-baseline ${config.spacing}`}>
        <motion.span
          variants={letterVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          style={{ color: colors.a, display: 'inline-block' }}
          className="select-none"
        >
          a
        </motion.span>
        <motion.span
          variants={letterVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          style={{ color: colors.k, display: 'inline-block' }}
          className="select-none"
        >
          k
        </motion.span>
        <motion.span
          variants={letterVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          style={{ color: colors.i1, display: 'inline-block' }}
          className="select-none"
        >
          i
        </motion.span>
        <motion.span
          variants={letterVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          style={{ color: colors.l, display: 'inline-block' }}
          className="select-none"
        >
          l
        </motion.span>
        <motion.span
          variants={letterVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          style={{ color: colors.i2, display: 'inline-block' }}
          className="select-none"
        >
          i
        </motion.span>
        <motion.span
          variants={letterVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          style={{ color: colors.i3, display: 'inline-block' }}
          className="select-none"
        >
          i
        </motion.span>
        <motion.span
          className={`${config.trademark} font-normal select-none`}
          style={{ color: colors.trademark }}
          animate={animated ? {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          whileHover={interactive ? {
            scale: 1.2,
            rotate: 15,
            transition: { duration: 0.3 }
          } : {}}
        >
          ™
        </motion.span>
      </div>
    </motion.div>
  );
}

export default AkiliiLogo;