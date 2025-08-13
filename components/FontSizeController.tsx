import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { 
  Type, 
  Minus, 
  Plus, 
  RotateCcw, 
  Check, 
  Settings,
  Eye,
  Zap
} from "lucide-react";

interface FontSizeContextType {
  fontSize: number;
  updateFontSize: (size: number) => void;
  resetFontSize: () => void;
  fontSizeClass: string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

interface FontSizeProviderProps {
  children: React.ReactNode;
}

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  const [fontSize, setFontSize] = useState(100); // Percentage
  const defaultFontSize = 100;

  // Load saved font size
  useEffect(() => {
    const savedFontSize = localStorage.getItem('akilii-font-size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }
  }, []);

  // Apply font size to CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--user-font-scale',
      `${fontSize / 100}`
    );
    
    // Apply to theme font size as well
    document.documentElement.style.setProperty(
      '--theme-font-size',
      `${(12 * fontSize) / 100}px`
    );
    
    // Save to localStorage
    localStorage.setItem('akilii-font-size', fontSize.toString());
  }, [fontSize]);

  const updateFontSize = (size: number) => {
    const clampedSize = Math.max(75, Math.min(150, size));
    setFontSize(clampedSize);
  };

  const resetFontSize = () => {
    setFontSize(defaultFontSize);
  };

  // Generate dynamic font size class
  const getFontSizeClass = () => {
    if (fontSize <= 85) return "text-scale-xs";
    if (fontSize <= 95) return "text-scale-sm";
    if (fontSize <= 105) return "text-scale-md";
    if (fontSize <= 125) return "text-scale-lg";
    return "text-scale-xl";
  };

  const value = {
    fontSize,
    updateFontSize,
    resetFontSize,
    fontSizeClass: getFontSizeClass()
  };

  return (
    <FontSizeContext.Provider value={value}>
      <div className={`font-scale-${fontSize}`}>
        {children}
      </div>
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}

interface FontSizeControllerProps {
  className?: string;
  inline?: boolean;
}

export function FontSizeController({ className = "", inline = false }: FontSizeControllerProps) {
  const { fontSize, updateFontSize, resetFontSize } = useFontSize();
  const [isOpen, setIsOpen] = useState(false);

  const presetSizes = [
    { label: "Small", value: 85, icon: "A" },
    { label: "Medium", value: 100, icon: "A" },
    { label: "Large", value: 125, icon: "A" },
    { label: "Extra Large", value: 150, icon: "A" }
  ];

  const currentPreset = presetSizes.find(preset => 
    Math.abs(preset.value - fontSize) <= 5
  );

  if (inline) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFontSize(fontSize - 5)}
          disabled={fontSize <= 75}
          className="text-white/60 hover:text-white w-8 h-8 p-0 flex-shrink-0"
          title="Decrease font size"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <div className="flex items-center gap-2 px-2 py-1 akilii-glass rounded-lg border border-white/20 min-w-0">
          <Type className="h-3 w-3 text-white/80 flex-shrink-0" />
          <span className="text-white text-xs font-medium text-truncate">
            {fontSize}%
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFontSize(fontSize + 5)}
          disabled={fontSize >= 150}
          className="text-white/60 hover:text-white w-8 h-8 p-0 flex-shrink-0"
          title="Increase font size"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-responsive akilii-glass hover:akilii-glass-premium border border-white/20 text-white transition-all duration-200"
        title="Font size settings"
      >
        <Type className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="text-fit-sm font-medium text-truncate">
          {currentPreset?.label || `${fontSize}%`}
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Font Size Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 z-50 w-80"
            >
              <Card className="akilii-glass-premium border-white/30 shadow-2xl">
                <CardContent className="p-4 space-y-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 akilii-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <Type className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-medium text-fit">Font Size</h3>
                        <p className="text-white/60 text-xs text-truncate">
                          Adjust text size for comfort
                        </p>
                      </div>
                    </div>
                    
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 badge-text-fit">
                      <Eye className="h-3 w-3 mr-1" />
                      {fontSize}%
                    </Badge>
                  </div>

                  {/* Preset Buttons */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-xs font-medium">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetSizes.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFontSize(preset.value)}
                          className={`
                            justify-start akilii-glass hover:akilii-glass-elevated border transition-all duration-200
                            ${Math.abs(preset.value - fontSize) <= 5
                              ? "border-blue-400/50 bg-blue-500/20 text-blue-300"
                              : "border-white/20 text-white"
                            }
                          `}
                        >
                          <span
                            className="font-bold mr-2 flex-shrink-0"
                            style={{ 
                              fontSize: `${12 * (preset.value / 100)}px`,
                              transform: `scale(${Math.min(1.2, preset.value / 100)})`
                            }}
                          >
                            {preset.icon}
                          </span>
                          <span className="text-fit-sm text-truncate">{preset.label}</span>
                          {Math.abs(preset.value - fontSize) <= 5 && (
                            <Check className="h-3 w-3 ml-auto flex-shrink-0" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Fine Control Slider */}
                  <div className="space-y-3">
                    <label className="text-white/80 text-xs font-medium">Fine Adjustment</label>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFontSize(fontSize - 5)}
                        disabled={fontSize <= 75}
                        className="text-white/60 hover:text-white w-8 h-8 p-0 flex-shrink-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex-1">
                        <Slider
                          value={[fontSize]}
                          onValueChange={([value]) => updateFontSize(value)}
                          min={75}
                          max={150}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFontSize(fontSize + 5)}
                        disabled={fontSize >= 150}
                        className="text-white/60 hover:text-white w-8 h-8 p-0 flex-shrink-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>75%</span>
                      <span className="text-white/70 font-medium">{fontSize}%</span>
                      <span>150%</span>
                    </div>
                  </div>

                  {/* Preview Text */}
                  <div className="space-y-2">
                    <label className="text-white/80 text-xs font-medium">Preview</label>
                    <div className="akilii-glass rounded-lg p-3 border border-white/10">
                      <p 
                        className="text-white"
                        style={{ fontSize: `${12 * (fontSize / 100)}px` }}
                      >
                        Sample text at {fontSize}% size. This helps you see how the interface will look with your chosen font size.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFontSize}
                      className="text-white/60 hover:text-white btn-responsive"
                    >
                      <RotateCcw className="h-3 w-3 mr-2" />
                      Reset
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="akilii-gradient-primary text-white btn-responsive"
                    >
                      <Check className="h-3 w-3 mr-2" />
                      Apply
                    </Button>
                  </div>

                  {/* Accessibility Note */}
                  <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <Zap className="h-3 w-3 text-blue-300 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-300 text-xs leading-relaxed">
                      Font size changes apply instantly and are saved for your next visit.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add to global CSS for font scaling
export const fontSizeStyles = `
  :root {
    --user-font-scale: 1;
  }

  .font-scale-75 { --user-font-scale: 0.75; }
  .font-scale-80 { --user-font-scale: 0.8; }
  .font-scale-85 { --user-font-scale: 0.85; }
  .font-scale-90 { --user-font-scale: 0.9; }
  .font-scale-95 { --user-font-scale: 0.95; }
  .font-scale-100 { --user-font-scale: 1; }
  .font-scale-105 { --user-font-scale: 1.05; }
  .font-scale-110 { --user-font-scale: 1.1; }
  .font-scale-115 { --user-font-scale: 1.15; }
  .font-scale-120 { --user-font-scale: 1.2; }
  .font-scale-125 { --user-font-scale: 1.25; }
  .font-scale-130 { --user-font-scale: 1.3; }
  .font-scale-135 { --user-font-scale: 1.35; }
  .font-scale-140 { --user-font-scale: 1.4; }
  .font-scale-145 { --user-font-scale: 1.45; }
  .font-scale-150 { --user-font-scale: 1.5; }

  /* Apply user font scale to all text utilities */
  .text-fit { font-size: calc(clamp(0.625rem, 1.5vw, 0.75rem) * var(--user-font-scale)); }
  .text-fit-sm { font-size: calc(clamp(0.5rem, 1vw, 0.625rem) * var(--user-font-scale)); }
  .text-fit-lg { font-size: calc(clamp(0.75rem, 2vw, 0.875rem) * var(--user-font-scale)); }
  .text-fit-xl { font-size: calc(clamp(0.875rem, 2.5vw, 1rem) * var(--user-font-scale)); }
`;