import React from 'react';
import { motion } from 'motion/react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  enablePadding?: boolean;
  enableMobileHeader?: boolean;
  enableMobileFooter?: boolean;
  fullHeight?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  enablePadding = true,
  enableMobileHeader = true,
  enableMobileFooter = true,
  fullHeight = true
}) => {
  const paddingClasses = enablePadding ? 'px-4 sm:px-6 lg:px-8' : '';
  
  // iPhone 16 optimized spacing
  const topSpacing = enableMobileHeader ? 'pt-20 lg:pt-8' : 'pt-4 lg:pt-8';
  const bottomSpacing = enableMobileFooter ? 'pb-24 lg:pb-8' : 'pb-4 lg:pb-8';
  
  // Full height classes with iPhone 16 support
  const heightClasses = fullHeight 
    ? 'min-h-[100vh] min-h-[100dvh] h-full' 
    : 'min-h-screen';

  return (
    <div className={`${heightClasses} ${topSpacing} ${bottomSpacing} ${paddingClasses} ${className} relative`} 
         style={{
           // iPhone 16 safe area support
           paddingTop: `max(${enableMobileHeader ? '5rem' : '1rem'}, env(safe-area-inset-top))`,
           paddingBottom: `max(${enableMobileFooter ? '6rem' : '1rem'}, env(safe-area-inset-bottom))`,
           paddingLeft: `max(1rem, env(safe-area-inset-left))`,
           paddingRight: `max(1rem, env(safe-area-inset-right))`,
           minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
           minHeight: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
         }}>
      <div className="max-w-7xl mx-auto w-full h-full">
        {children}
      </div>
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  gap = 'gap-4 sm:gap-6 lg:gap-8',
  className = ''
}) => {
  const gridCols = `grid-cols-${columns.mobile} sm:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;
  
  return (
    <div className={`grid ${gridCols} ${gap} ${className} w-full`}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = true,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-10'
  };

  const hoverClasses = hover ? 'hover:akilii-glass-elevated hover:scale-[1.02] hover:-translate-y-1' : '';
  const interactiveClasses = onClick ? 'cursor-pointer touch-manipulation' : '';

  return (
    <motion.div
      className={`akilii-glass-premium rounded-2xl sm:rounded-3xl border border-border/40 transition-all duration-500 ${paddingClasses[padding]} ${hoverClasses} ${interactiveClasses} ${className} w-full`}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : {}}
      style={{
        // Ensure proper touch targets for iPhone 16
        minHeight: onClick ? '44px' : 'auto',
        minWidth: onClick ? '44px' : 'auto'
      }}
    >
      {children}
    </motion.div>
  );
};

interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 touch-manipulation';
  
  // iPhone 16 optimized tap targets (minimum 44px)
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px]',
    md: 'px-6 py-3.5 text-base min-h-[48px]', 
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };

  const variantClasses = {
    primary: 'akilii-gradient-animated-button text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border-2 border-border bg-transparent hover:bg-accent',
    ghost: 'bg-transparent hover:bg-accent'
  };

  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : 'active:scale-95';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      style={{
        // iPhone 16 touch optimization
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </motion.button>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'display' | 'heading' | 'title' | 'body' | 'caption';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  className = ''
}) => {
  // iPhone 16 optimized text scaling
  const variantClasses = {
    display: 'text-2xl sm:text-3xl lg:text-5xl font-black leading-tight',
    heading: 'text-xl sm:text-2xl lg:text-3xl font-bold leading-tight',
    title: 'text-lg sm:text-xl lg:text-2xl font-bold leading-snug',
    body: 'text-sm sm:text-base lg:text-lg leading-relaxed',
    caption: 'text-xs sm:text-sm lg:text-base leading-normal'
  };

  return (
    <div className={`${variantClasses[variant]} ${className} break-words`}>
      {children}
    </div>
  );
};

// iPhone 16 specific full-screen container
interface FullScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const FullScreenContainer: React.FC<FullScreenContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`w-full ${className}`}
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        minHeight: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {children}
    </div>
  );
};