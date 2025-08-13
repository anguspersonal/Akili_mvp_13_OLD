import React from "react";
import { Button } from "./ui/button";
import { useTheme, ThemeCustomizerButton } from "./ThemeCustomizer";
import { Sun, Moon, MoonIcon } from "lucide-react";

export function QuickThemeSwitch() {
  const { theme, updateTheme } = useTheme();

  const themeOptions = [
    { mode: "light" as const, icon: Sun, label: "Light" },
    { mode: "dark" as const, icon: Moon, label: "Dark" }, 
    { mode: "darker" as const, icon: MoonIcon, label: "Darker" }
  ];

  const currentTheme = themeOptions.find(opt => opt.mode === theme.mode);
  const CurrentIcon = currentTheme?.icon || Moon;

  const cycleTheme = () => {
    const currentIndex = themeOptions.findIndex(opt => opt.mode === theme.mode);
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    updateTheme({ mode: themeOptions[nextIndex].mode });
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Quick Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleTheme}
        className="btn-responsive akilii-glass hover:akilii-glass-premium border border-white/20 text-white transition-all duration-200 min-w-0"
        title={`Current: ${currentTheme?.label || 'Dark'} - Click to cycle themes`}
      >
        <CurrentIcon className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="text-fit-sm font-medium text-truncate">
          {currentTheme?.label || 'Dark'}
        </span>
      </Button>

      {/* Full Theme Customizer */}
      <ThemeCustomizerButton />
    </div>
  );
}