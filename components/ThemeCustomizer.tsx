import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "darker";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  themes: Theme[];
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  cycleTheme: () => null,
  themes: ["light", "dark", "darker"],
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "akilii-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const themes: Theme[] = ["light", "dark", "darker"];

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Get stored theme
    const storedTheme = localStorage.getItem(storageKey);
    
    if (storedTheme && themes.includes(storedTheme as Theme)) {
      setTheme(storedTheme as Theme);
      
      // Apply theme to DOM
      root.classList.remove(...themes);
      root.classList.add(storedTheme);
    } else {
      // Apply default theme
      setTheme(defaultTheme);
      
      root.classList.remove(...themes);
      root.classList.add(defaultTheme);
      
      // Store default theme
      localStorage.setItem(storageKey, defaultTheme);
    }
  }, [defaultTheme, storageKey, themes]);

  const handleSetTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove(...themes);
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Update state and storage
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    handleSetTheme(nextTheme);
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    cycleTheme,
    themes,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

// Enhanced theme hook with additional utilities
export const useThemeUtils = () => {
  const { theme, setTheme, cycleTheme, themes } = useTheme();

  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isDarker = theme === "darker";

  const getThemeName = () => {
    switch (theme) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      case "darker":
        return "Darker Mode";
      default:
        return "Dark Mode";
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "darker":
        return "🌑";
      default:
        return "🌙";
    }
  };

  const getThemeColor = () => {
    switch (theme) {
      case "light":
        return "var(--akilii-yellow)";
      case "dark":
        return "var(--akilii-blue)";
      case "darker":
        return "var(--akilii-purple)";
      default:
        return "var(--akilii-blue)";
    }
  };

  return {
    theme,
    setTheme,
    cycleTheme,
    themes,
    isLight,
    isDark,
    isDarker,
    getThemeName,
    getThemeIcon,
    getThemeColor,
  };
};

// Theme-aware component wrapper
export function ThemeAware({ 
  children, 
  lightContent, 
  darkContent, 
  darkerContent 
}: {
  children?: React.ReactNode;
  lightContent?: React.ReactNode;
  darkContent?: React.ReactNode;
  darkerContent?: React.ReactNode;
}) {
  const { theme } = useTheme();

  if (lightContent && theme === "light") return <>{lightContent}</>;
  if (darkContent && theme === "dark") return <>{darkContent}</>;
  if (darkerContent && theme === "darker") return <>{darkerContent}</>;
  
  return <>{children}</>;
}

// Theme transition wrapper for smooth theme changes
export function ThemeTransition({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
}

export default ThemeProvider;