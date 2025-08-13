// Get FullSpektrum® colors based on theme
export function getFullSpektrumColors(theme: string) {
  const logoColor = '#4ecdc4'; // Main FS logo teal color
  
  return {
    // In light mode, both Full and Spektrum use the same logo color
    // In dark/darker modes, keep existing colors for contrast
    full: theme === 'light' ? logoColor : '#4ecdc4',
    spektrum: theme === 'light' ? logoColor : '#00cec9'
  };
}

// Initialize theme on app start with smooth transitions
export function initializeTheme() {
  const root = document.documentElement;
  
  // Get stored theme or default to dark
  const storedTheme = localStorage.getItem('akilii-theme');
  const validThemes = ['light', 'dark', 'darker'];
  
  if (storedTheme && validThemes.includes(storedTheme)) {
    // Apply stored theme with transition
    root.classList.remove('light', 'dark', 'darker');
    root.classList.add(storedTheme);
  } else {
    // Default to dark theme if no valid theme is stored
    localStorage.setItem('akilii-theme', 'dark');
    root.classList.remove('light', 'dark', 'darker');
    root.classList.add('dark');
  }
}

// Enhanced mouse position tracking with activity detection
export function useMouseTracking() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseActive, setIsMouseActive] = useState(false);

  return {
    mousePosition,
    isMouseActive,
    handleMouseMove: (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMouseActive(true);
      
      const timeout = setTimeout(() => setIsMouseActive(false), 2000);
      return () => clearTimeout(timeout);
    }
  };
}