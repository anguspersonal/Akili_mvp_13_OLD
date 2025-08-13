import { useState, useEffect } from 'react';

// Enhanced Theme Hook with Smooth Transitions
export function useEnhancedTheme() {
  const [theme, setTheme] = useState('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsTransitioning(true);
      
      if (document.documentElement.classList.contains('light')) {
        setTheme('light');
      } else if (document.documentElement.classList.contains('darker')) {
        setTheme('darker');
      } else {
        setTheme('dark');
      }
      
      setTimeout(() => setIsTransitioning(false), 400);
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

  return { theme, isTransitioning };
}