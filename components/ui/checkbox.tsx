import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.2.3";
import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "./utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "premium" | "accessible";
  }
>(({ className, size = "md", variant = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "premium":
        return "akilii-glass-elevated border-2 border-white/30 data-[state=checked]:akilii-gradient-primary data-[state=checked]:border-transparent hover:border-white/50 hover:akilii-glass-premium";
      case "accessible":
        return "border-2 border-white/40 bg-white/10 backdrop-blur-sm data-[state=checked]:akilii-gradient-primary data-[state=checked]:border-transparent hover:border-white/60 hover:bg-white/20 focus-visible:ring-4 focus-visible:ring-akilii-purple/30";
      default:
        return "border border-white/30 akilii-glass data-[state=checked]:akilii-gradient-primary data-[state=checked]:text-white hover:border-white/50";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer shrink-0 rounded-lg text-white shadow-lg transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-akilii-purple focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:animate-akilii-pulse",
          sizeClasses[size],
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {props["data-state"] === "indeterminate" ? (
              <Minus className={iconSizes[size]} />
            ) : (
              <Check className={iconSizes[size]} />
            )}
          </motion.div>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </motion.div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Enhanced Checkbox with Label for better accessibility
const CheckboxWithLabel = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    label: string;
    description?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "premium" | "accessible";
  }
>(({ label, description, size = "md", variant = "accessible", className, ...props }, ref) => {
  const labelSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <motion.div 
      className="flex items-start gap-4 group cursor-pointer p-2 rounded-xl hover:akilii-glass transition-all duration-200"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <Checkbox
        ref={ref}
        size={size}
        variant={variant}
        className={className}
        {...props}
      />
      <div className="flex-1 space-y-1">
        <label 
          htmlFor={props.id}
          className={cn(
            "font-medium text-white cursor-pointer leading-tight",
            labelSizes[size],
            "group-hover:text-white/90 transition-colors duration-200"
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-white/70 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
});

CheckboxWithLabel.displayName = "CheckboxWithLabel";

// Checkbox Group for multiple selections
const CheckboxGroup = ({
  options,
  value = [],
  onChange,
  size = "md",
  variant = "accessible",
  className = ""
}: {
  options: Array<{ id: string; label: string; description?: string; disabled?: boolean }>;
  value?: string[];
  onChange?: (value: string[]) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "premium" | "accessible";
  className?: string;
}) => {
  const handleChange = (optionId: string, checked: boolean) => {
    if (!onChange) return;
    
    if (checked) {
      onChange([...value, optionId]);
    } else {
      onChange(value.filter(id => id !== optionId));
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {options.map((option) => (
        <CheckboxWithLabel
          key={option.id}
          id={option.id}
          label={option.label}
          description={option.description}
          size={size}
          variant={variant}
          checked={value.includes(option.id)}
          onCheckedChange={(checked) => handleChange(option.id, !!checked)}
          disabled={option.disabled}
        />
      ))}
    </div>
  );
};

export { Checkbox, CheckboxWithLabel, CheckboxGroup };