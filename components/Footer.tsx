import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import fsLogo from "figma:asset/2578318f62b94eff505d67b6bc61e79fccbe1dc5.png";

interface FooterProps {
  className?: string;
}

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

// Get body text colors based on theme
function getBodyTextColor(theme: string) {
  switch (theme) {
    case 'light':
      return '#1a1a1a'; // Dark grey for light mode
    case 'dark':
    case 'darker':
    default:
      return '#ffffff'; // White for dark modes
  }
}

// Get premium gradient colors for divider based on theme
function getPremiumDividerGradient(theme: string) {
  switch (theme) {
    case 'light':
      return {
        background: 'linear-gradient(to bottom, transparent 0%, #4ecdc4 20%, #00cec9 50%, #4ecdc4 80%, transparent 100%)',
        shadow: 'drop-shadow(0 0 4px rgba(78, 205, 196, 0.3))'
      };
    case 'dark':
      return {
        background: 'linear-gradient(to bottom, transparent 0%, #4ecdc4 15%, #a8e6cf 50%, #4ecdc4 85%, transparent 100%)',
        shadow: 'drop-shadow(0 0 6px rgba(168, 230, 207, 0.4))'
      };
    case 'darker':
    default:
      return {
        background: 'linear-gradient(to bottom, transparent 0%, #4ecdc4 10%, #a8e6cf 50%, #4ecdc4 90%, transparent 100%)',
        shadow: 'drop-shadow(0 0 8px rgba(168, 230, 207, 0.5))'
      };
  }
}

export function Footer({ className = '' }: FooterProps) {
  const theme = useCurrentTheme();
  const fsColors = getFullSpektrumColors(theme);
  const bodyTextColor = getBodyTextColor(theme);
  const dividerGradient = getPremiumDividerGradient(theme);

  return (
    <motion.div
      className={`
        px-6 py-4
        flex items-center justify-center gap-2
        transition-all duration-300
        w-auto max-w-fit mx-auto
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
    >
      {/* A FullSpektrum® Innovation Section */}
      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* "A" text - body text color */}
        <motion.span 
          className="text-sm font-medium tracking-wide whitespace-nowrap"
          style={{ color: bodyTextColor }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          A
        </motion.span>
        
        {/* FullSpektrum Logo with Enhanced Animation */}
        <motion.div
          className="flex items-center justify-center flex-shrink-0 relative"
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, 0],
          }}
          transition={{ 
            scale: { duration: 0.2 },
            rotate: { duration: 0.6, ease: "easeInOut" }
          }}
        >
          {/* Logo Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.8, 1.3, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="relative z-10"
            animate={{
              filter: [
                "drop-shadow(0 0 4px rgba(78, 205, 196, 0.4))",
                "drop-shadow(0 0 8px rgba(78, 205, 196, 0.6))",
                "drop-shadow(0 0 4px rgba(78, 205, 196, 0.4))"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ImageWithFallback
              src={fsLogo}
              alt="FullSpektrum Logo"
              className="h-6 w-6 md:h-7 md:w-7 object-contain"
              style={{
                filter: "brightness(1.1) contrast(1.1)"
              }}
            />
          </motion.div>
        </motion.div>
        
        {/* FullSpektrum® Brand Text - Theme-Responsive Colors with Glow */}
        <div className="flex items-center">
          {/* "Full" - Theme-responsive color with glow animation */}
          <motion.span 
            className="font-bold tracking-wide whitespace-nowrap relative"
            style={{ 
              fontSize: '12px',
              color: fsColors.full,
              textShadow: `0 0 4px ${fsColors.full}40`
            }}
            animate={{
              textShadow: [
                `0 0 4px ${fsColors.full}40`,
                `0 0 8px ${fsColors.full}60, 0 0 12px ${fsColors.full}30`,
                `0 0 4px ${fsColors.full}40`
              ],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Full
          </motion.span>
          
          {/* "Spektrum®" - Theme-responsive color with subtle glow */}
          <motion.span 
            className="font-normal tracking-wide whitespace-nowrap relative"
            style={{ 
              fontSize: '12px',
              color: fsColors.spektrum,
              textShadow: `0 0 3px ${fsColors.spektrum}40`
            }}
            animate={{
              textShadow: [
                `0 0 3px ${fsColors.spektrum}40`,
                `0 0 6px ${fsColors.spektrum}60, 0 0 9px ${fsColors.spektrum}20`,
                `0 0 3px ${fsColors.spektrum}40`
              ],
              opacity: [0.85, 1, 0.85]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            Spektrum®
          </motion.span>
        </div>
        
        {/* Innovation Text - body text color */}
        <motion.span 
          className="text-sm font-medium tracking-wide whitespace-nowrap"
          style={{ color: bodyTextColor }}
          animate={{
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          Innovation
        </motion.span>
      </motion.div>

      {/* Premium Gradient Divider */}
      <motion.div 
        className="flex-shrink-0 relative"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
      >
        {/* Main divider with premium gradient */}
        <motion.div
          className="w-px h-6 relative"
          style={{
            background: dividerGradient.background,
            filter: dividerGradient.shadow
          }}
          animate={{
            filter: [
              dividerGradient.shadow,
              dividerGradient.shadow.replace('0.3)', '0.6)').replace('0.4)', '0.7)').replace('0.5)', '0.8)'),
              dividerGradient.shadow
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Glow effect overlay */}
        <motion.div
          className="absolute inset-0 w-px h-6"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(168, 230, 207, 0.3) 50%, transparent 100%)',
            filter: 'blur(1px)'
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </motion.div>

      {/* Copyright Statement - body text color */}
      <motion.div 
        className="text-sm font-medium tracking-wide flex-shrink-0"
        style={{ color: bodyTextColor }}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <span className="whitespace-nowrap">
          © 2025
        </span>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Compact version for smaller screens or specific contexts
export function CompactFooter({ className = '' }: FooterProps) {
  const theme = useCurrentTheme();
  const fsColors = getFullSpektrumColors(theme);
  const bodyTextColor = getBodyTextColor(theme);
  const dividerGradient = getPremiumDividerGradient(theme);

  return (
    <motion.div
      className={`
        flex items-center justify-center gap-1 text-xs px-4 py-2
        w-auto max-w-fit mx-auto
        ${className}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
    >
      {/* FS Logo */}
      <motion.div
        className="relative"
        whileHover={{ 
          scale: 1.1,
          filter: "drop-shadow(0 0 4px rgba(78, 205, 196, 0.6))"
        }}
        transition={{ duration: 0.2 }}
      >
        <ImageWithFallback
          src={fsLogo}
          alt="FS"
          className="h-4 w-4 object-contain flex-shrink-0"
          style={{
            filter: "drop-shadow(0 0 2px rgba(78, 205, 196, 0.4))"
          }}
        />
      </motion.div>
      
      {/* Brand name - theme-responsive colors with animations */}
      <span className="whitespace-nowrap font-medium text-xs" style={{ color: bodyTextColor }}>
        A
      </span>
      <motion.span 
        className="whitespace-nowrap font-bold" 
        style={{ 
          fontSize: '10px',
          color: fsColors.full,
          textShadow: `0 0 3px ${fsColors.full}40`
        }}
        animate={{ 
          textShadow: [
            `0 0 3px ${fsColors.full}40`,
            `0 0 6px ${fsColors.full}60`,
            `0 0 3px ${fsColors.full}40`
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        Full
      </motion.span>
      <motion.span 
        className="whitespace-nowrap font-normal" 
        style={{ 
          fontSize: '10px',
          color: fsColors.spektrum,
          textShadow: `0 0 2px ${fsColors.spektrum}40`
        }}
        animate={{ 
          textShadow: [
            `0 0 2px ${fsColors.spektrum}40`,
            `0 0 5px ${fsColors.spektrum}60`,
            `0 0 2px ${fsColors.spektrum}40`
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        Spektrum®
      </motion.span>
      <span className="whitespace-nowrap font-medium text-xs" style={{ color: bodyTextColor }}>
        Innovation
      </span>
      
      {/* Premium Gradient Divider - Compact */}
      <motion.div 
        className="flex-shrink-0 relative mx-1"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      >
        <motion.div
          className="w-px h-4 relative"
          style={{
            background: dividerGradient.background,
            filter: dividerGradient.shadow
          }}
          animate={{
            filter: [
              dividerGradient.shadow,
              dividerGradient.shadow.replace('0.3)', '0.5)').replace('0.4)', '0.6)').replace('0.5)', '0.7)'),
              dividerGradient.shadow
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <span className="whitespace-nowrap text-xs" style={{ color: bodyTextColor, opacity: 0.6 }}>
        © 2025
      </span>
    </motion.div>
  );
}

// Enhanced Inline version for use in other components
export function InlineFooter({ className = '' }: FooterProps) {
  const theme = useCurrentTheme();
  const fsColors = getFullSpektrumColors(theme);
  const bodyTextColor = getBodyTextColor(theme);
  const dividerGradient = getPremiumDividerGradient(theme);

  return (
    <div className={`flex items-center justify-center gap-1 text-xs ${className}`}>
      <motion.div
        className="relative"
        whileHover={{ 
          scale: 1.05,
          filter: "drop-shadow(0 0 3px rgba(78, 205, 196, 0.5))"
        }}
        transition={{ duration: 0.2 }}
      >
        <ImageWithFallback
          src={fsLogo}
          alt="FS"
          className="h-3 w-3 object-contain flex-shrink-0"
          style={{
            filter: "drop-shadow(0 0 2px rgba(78, 205, 196, 0.3))"
          }}
        />
      </motion.div>
      
      <span className="font-medium tracking-wide whitespace-nowrap text-xs" style={{ color: bodyTextColor }}>
        A
      </span>
      <motion.span 
        className="font-bold tracking-wide whitespace-nowrap" 
        style={{ 
          fontSize: '10px',
          color: fsColors.full,
          textShadow: `0 0 2px ${fsColors.full}40`
        }}
        animate={{ 
          textShadow: [
            `0 0 2px ${fsColors.full}40`,
            `0 0 4px ${fsColors.full}60`,
            `0 0 2px ${fsColors.full}40`
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        Full
      </motion.span>
      <motion.span 
        className="font-normal tracking-wide whitespace-nowrap" 
        style={{ 
          fontSize: '10px',
          color: fsColors.spektrum,
          textShadow: `0 0 2px ${fsColors.spektrum}40`
        }}
        animate={{ 
          textShadow: [
            `0 0 2px ${fsColors.spektrum}40`,
            `0 0 4px ${fsColors.spektrum}60`,
            `0 0 2px ${fsColors.spektrum}40`
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        Spektrum®
      </motion.span>
      <span className="font-medium tracking-wide whitespace-nowrap text-xs" style={{ color: bodyTextColor }}>
        Innovation
      </span>
      
      {/* Premium Gradient Divider - Inline */}
      <motion.div 
        className="flex-shrink-0 relative mx-1"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <motion.div
          className="w-px h-3 relative"
          style={{
            background: dividerGradient.background,
            filter: dividerGradient.shadow
          }}
          animate={{
            filter: [
              dividerGradient.shadow,
              dividerGradient.shadow.replace('0.3)', '0.5)').replace('0.4)', '0.6)').replace('0.5)', '0.7)'),
              dividerGradient.shadow
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <span style={{ color: bodyTextColor, opacity: 0.6 }}>© 2025</span>
    </div>
  );
}

// Premium version with advanced animations and fallback logo
export function PremiumFooter({ className = '' }: FooterProps) {
  const theme = useCurrentTheme();
  const fsColors = getFullSpektrumColors(theme);
  const bodyTextColor = getBodyTextColor(theme);
  const dividerGradient = getPremiumDividerGradient(theme);

  // Fallback logo as SVG in case image fails to load
  const FallbackLogo = () => (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 100 100" 
      className="h-6 w-6 md:h-7 md:w-7"
      style={{ filter: "drop-shadow(0 0 4px rgba(78, 205, 196, 0.4))" }}
    >
      <defs>
        <linearGradient id="fsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ecdc4" />
          <stop offset="100%" stopColor="#00cec9" />
        </linearGradient>
      </defs>
      <path 
        d="M20 20 Q50 10 80 20 Q70 50 80 80 Q50 70 20 80 Q30 50 20 20 Z" 
        fill="url(#fsGradient)"
      />
      <ellipse cx="50" cy="50" rx="12" ry="18" fill="white" />
    </svg>
  );

  return (
    <motion.div
      className={`
        px-8 py-6
        flex items-center justify-center gap-3
        transition-all duration-300
        w-auto max-w-fit mx-auto
        ${className}
      `}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: 0.3, 
        duration: 0.8, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
    >
      {/* Enhanced A FullSpektrum® Innovation Section */}
      <motion.div
        className="flex items-center gap-2 relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
      >
        {/* Floating particles around logo */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-akilii-teal rounded-full pointer-events-none"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [-5, 5, -5],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
        
        {/* "A" text - body text color */}
        <motion.span 
          className="font-semibold tracking-wide whitespace-nowrap"
          style={{ fontSize: '16px', color: bodyTextColor }}
          animate={{
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          A
        </motion.span>
        
        {/* Premium FullSpektrum Logo with Complex Animation */}
        <motion.div
          className="flex items-center justify-center flex-shrink-0 relative"
          whileHover={{ 
            scale: 1.15,
            rotate: [0, -10, 10, 0],
          }}
          transition={{ 
            scale: { duration: 0.3, ease: "easeOut" },
            rotate: { duration: 0.8, ease: "easeInOut" }
          }}
        >
          {/* Multi-layered glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(78, 205, 196, 0.4) 0%, rgba(255, 107, 157, 0.2) 50%, transparent 70%)",
              filter: "blur(15px)",
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.7, 1.4, 0.7],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255, 230, 109, 0.3) 0%, transparent 60%)",
              filter: "blur(10px)",
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [1, 1.6, 1],
              rotate: [360, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <motion.div
            className="relative z-10"
            animate={{
              filter: [
                "drop-shadow(0 0 6px rgba(78, 205, 196, 0.5))",
                "drop-shadow(0 0 12px rgba(78, 205, 196, 0.8)) drop-shadow(0 0 20px rgba(255, 107, 157, 0.3))",
                "drop-shadow(0 0 6px rgba(78, 205, 196, 0.5))"
              ],
              y: [0, -1, 0]
            }}
            transition={{
              filter: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <ImageWithFallback
              src={fsLogo}
              alt="FullSpektrum Logo"
              className="h-7 w-7 md:h-8 md:w-8 object-contain"
              fallback={<FallbackLogo />}
            />
          </motion.div>
        </motion.div>
        
        {/* Enhanced FullSpektrum® Brand Text - Theme-Responsive Colors with Premium Glow */}
        <div className="flex items-center relative">
          {/* "Full" - Theme-responsive color with enhanced glow */}
          <motion.span 
            className="font-bold tracking-wide whitespace-nowrap relative"
            style={{ 
              fontSize: '15px',
              color: fsColors.full,
              textShadow: `0 0 6px ${fsColors.full}50`
            }}
            animate={{
              textShadow: [
                `0 0 6px ${fsColors.full}50`,
                `0 0 12px ${fsColors.full}80, 0 0 20px ${fsColors.full}40`,
                `0 0 6px ${fsColors.full}50`
              ],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Full
          </motion.span>
          
          {/* "Spektrum®" - Theme-responsive color with elegant glow */}
          <motion.span 
            className="font-light tracking-wide whitespace-nowrap relative"
            style={{ 
              fontSize: '15px',
              color: fsColors.spektrum,
              textShadow: `0 0 5px ${fsColors.spektrum}60`
            }}
            animate={{
              textShadow: [
                `0 0 5px ${fsColors.spektrum}60`,
                `0 0 10px ${fsColors.spektrum}80, 0 0 16px ${fsColors.spektrum}30`,
                `0 0 5px ${fsColors.spektrum}60`
              ],
              opacity: [0.85, 1, 0.85],
              x: [0, 1, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          >
            Spektrum®
          </motion.span>
          
          {/* Subtle underline animation */}
          <motion.div
            className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-akilii-teal to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.3, duration: 1, ease: "easeOut" }}
          />
        </div>
        
        {/* Innovation Text - body text color */}
        <motion.span 
          className="font-semibold tracking-wide whitespace-nowrap"
          style={{ fontSize: '16px', color: bodyTextColor }}
          animate={{
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        >
          Innovation
        </motion.span>
      </motion.div>

      {/* Enhanced Premium Gradient Divider */}
      <motion.div 
        className="flex-shrink-0 relative"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
      >
        {/* Main divider with premium gradient */}
        <motion.div
          className="w-px h-8 relative"
          style={{
            background: dividerGradient.background,
            filter: dividerGradient.shadow
          }}
          animate={{
            filter: [
              dividerGradient.shadow,
              dividerGradient.shadow.replace('0.3)', '0.8)').replace('0.4)', '0.9)').replace('0.5)', '1.0)'),
              dividerGradient.shadow
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Enhanced glow effect overlay */}
        <motion.div
          className="absolute inset-0 w-px h-8"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(168, 230, 207, 0.4) 50%, transparent 100%)',
            filter: 'blur(2px)'
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Additional sparkle effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 230, 207, 0.8) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>

      {/* Enhanced Copyright Statement - body text color */}
      <motion.div 
        className="text-sm font-medium tracking-wide flex-shrink-0"
        style={{ color: bodyTextColor }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
      >
        <motion.span 
          className="whitespace-nowrap"
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          © 2025
        </motion.span>
      </motion.div>
    </motion.div>
  );
}