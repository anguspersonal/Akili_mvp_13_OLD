import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedAkiliiLogoAdvanced } from './AnimatedAkiliiLogo';
import { AkiliiLogo } from './AkiliiLogo';

interface AkiliiBrandProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  animated?: boolean;
  inline?: boolean;
  className?: string;
  logoType?: 'basic' | 'advanced';
  interactive?: boolean;
  taglineAnimation?: 'fade' | 'slide' | 'typewriter';
}

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 50, delay: number = 0) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        let i = 0;
        const timer = setInterval(() => {
          if (i < text.length) {
            setDisplayText(text.slice(0, i + 1));
            i++;
          } else {
            setIsComplete(true);
            clearInterval(timer);
          }
        }, speed);

        return () => clearInterval(timer);
      }, delay);

      return () => clearTimeout(delayTimeout);
    } else {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }
  }, [text, speed, delay]);

  return { displayText, isComplete };
}

// Get current theme hook
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

export function AkiliiBrand({
  size = 'md',
  showTagline = false,
  animated = true,
  inline = false,
  className = '',
  logoType = 'advanced',
  interactive = true,
  taglineAnimation = 'fade'
}: AkiliiBrandProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const theme = useCurrentTheme();

  const taglineText = "AI for every unique mind";
  const { displayText: typewriterText, isComplete } = useTypewriter(
    taglineText, 
    80, 
    showContent ? 500 : 0
  );

  // Show content after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced size configuration with vertical layout focus
  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'xs':
        return {
          container: inline ? 'inline-flex flex-col' : 'flex flex-col',
          logoSize: 'xs' as const,
          taglineSize: 'text-xs',
          dividerWidth: 'w-12',
          dividerHeight: 'h-px',
          spacing: 'gap-2'
        };
      case 'sm':
        return {
          container: inline ? 'inline-flex flex-col' : 'flex flex-col',
          logoSize: 'sm' as const,
          taglineSize: 'text-sm',
          dividerWidth: 'w-16',
          dividerHeight: 'h-px',
          spacing: 'gap-3'
        };
      case 'md':
        return {
          container: 'flex flex-col',
          logoSize: 'md' as const,
          taglineSize: 'text-base',
          dividerWidth: 'w-20',
          dividerHeight: 'h-px',
          spacing: 'gap-3'
        };
      case 'lg':
        return {
          container: 'flex flex-col',
          logoSize: 'lg' as const,
          taglineSize: 'text-lg',
          dividerWidth: 'w-24',
          dividerHeight: 'h-0.5',
          spacing: 'gap-4'
        };
      case 'xl':
        return {
          container: 'flex flex-col',
          logoSize: 'xl' as const,
          taglineSize: 'text-xl',
          dividerWidth: 'w-32',
          dividerHeight: 'h-0.5',
          spacing: 'gap-5'
        };
      case '2xl':
        return {
          container: 'flex flex-col',
          logoSize: '2xl' as const,
          taglineSize: 'text-2xl',
          dividerWidth: 'w-40',
          dividerHeight: 'h-1',
          spacing: 'gap-6'
        };
      default:
        return {
          container: 'flex flex-col',
          logoSize: 'md' as const,
          taglineSize: 'text-base',
          dividerWidth: 'w-20',
          dividerHeight: 'h-px',
          spacing: 'gap-3'
        };
    }
  };

  const config = getSizeConfig(size);

  // Tagline animation variants - removed glow effects
  const taglineVariants = {
    fade: {
      initial: { opacity: 0, y: 10 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          ease: "easeOut",
          delay: 0.3
        }
      },
      hover: {
        scale: 1.02,
        transition: { duration: 0.3 }
      }
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          ease: "easeOut",
          delay: 0.3
        }
      },
      hover: {
        y: -2,
        transition: { duration: 0.3 }
      }
    },
    typewriter: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      hover: {
        scale: 1.02,
        transition: { duration: 0.3 }
      }
    }
  };

  const currentTaglineVariant = taglineVariants[taglineAnimation];

  // Container animation - removed glow effects
  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    },
    hover: {
      scale: 1.01,
      transition: { duration: 0.3 }
    }
  };

  // Premium gradient divider variants - clean design without glow
  const dividerVariants = {
    initial: { 
      scaleX: 0,
      opacity: 0
    },
    animate: { 
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.4
      }
    },
    hover: {
      scaleX: 1.1,
      opacity: 0.8,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`${config.container} ${config.spacing} items-center justify-center text-center relative ${className}`}
      variants={containerVariants}
      initial="initial"
      animate={showContent ? "animate" : "initial"}
      whileHover={interactive ? "hover" : "initial"}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      {/* Logo Component - removed glow effects */}
      <motion.div
        variants={{
          initial: { opacity: 0, scale: 0.8, rotate: -5 },
          animate: { 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            transition: {
              duration: 0.8,
              ease: "easeOut",
              type: "spring",
              damping: 20
            }
          }
        }}
        className="relative z-10"
      >
        {logoType === 'advanced' ? (
          <AnimatedAkiliiLogoAdvanced
            size={config.logoSize}
            animated={animated}
            inline={inline}
            interactive={interactive}
            showParticles={false}
            glowEffect={false}
            colorCycle={animated}
          />
        ) : (
          <AkiliiLogo
            size={config.logoSize}
            animated={animated}
            inline={inline}
            interactive={interactive}
          />
        )}
      </motion.div>

      {/* Premium Gradient Divider - clean design without glow */}
      {showTagline && (
        <motion.div
          variants={dividerVariants}
          initial="initial"
          animate={showContent ? "animate" : "initial"}
          whileHover={interactive ? "hover" : "initial"}
          className={`${config.dividerWidth} ${config.dividerHeight} relative overflow-hidden rounded-full`}
          style={{ originX: 0.5 }}
        >
          {/* Multi-layered premium gradient - no glow effects */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(168, 230, 207, 0.4) 15%,
                rgba(78, 205, 196, 0.6) 25%,
                rgba(255, 107, 157, 0.5) 40%,
                rgba(255, 230, 109, 0.6) 60%,
                rgba(78, 205, 196, 0.6) 75%,
                rgba(168, 230, 207, 0.4) 85%,
                transparent 100%
              )`
            }}
            animate={animated ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            } : {}}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Shimmer overlay - subtle effect without glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, 
                transparent 40%, 
                rgba(255, 255, 255, 0.2) 50%, 
                transparent 60%
              )`
            }}
            animate={animated ? {
              x: ['-100%', '100%']
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1
            }}
          />
        </motion.div>
      )}

      {/* Enhanced Tagline underneath - removed glow effects */}
      {showTagline && (
        <AnimatePresence>
          {showContent && (
            <motion.div
              variants={currentTaglineVariant}
              initial="initial"
              animate="animate"
              whileHover={interactive ? "hover" : "initial"}
              className={`${config.taglineSize} relative z-10 max-w-xs`}
              style={{
                fontFamily: 'var(--font-family)',
                letterSpacing: '0.02em'
              }}
            >
              {taglineAnimation === 'typewriter' ? (
                <span className="relative inline-block">
                  {typewriterText}
                  {!isComplete && (
                    <motion.span
                      className="inline-block w-0.5 h-5 bg-current ml-0.5"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </span>
              ) : (
                <motion.span 
                  className="akilii-two-tone-text-subtle block leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  {taglineText}
                </motion.span>
              )}
              
              {/* Simple hover effect for tagline - no glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg"
                animate={isHovering ? {
                  x: ['-100%', '100%'],
                } : {}}
                transition={{
                  duration: 1.5,
                  ease: "linear"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default AkiliiBrand;