import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { AnimatedAkiliiLogoAdvanced } from "./AnimatedAkiliiLogo";
import { FullSpektrumWatermark } from "./FullSpektrumLogo";
import { User } from "../utils/types";
import {
  Home,
  MessageSquare,
  BookOpen,
  User as UserIcon,
  Settings,
  LogOut,
  Brain,
  Sparkles,
  Calendar,
  FileText,
  Users,
  Shield,
  Briefcase,
  GraduationCap,
  ChevronRight,
  HelpCircle,
  Zap,
  Target,
  Heart
} from "lucide-react";

interface NavigationProps {
  currentUser: User;
  onNavigate: (section: string) => void;
  currentSection: string;
  onLogout: () => void;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Overview & insights",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "chat",
    label: "AI Chat",
    icon: MessageSquare,
    description: "Intelligent conversations",
    color: "from-purple-500 to-pink-500",
    badge: "Smart"
  },
  {
    id: "planning",
    label: "Planning",
    icon: Calendar,
    description: "Goals & scheduling",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "journal",
    label: "Journal",
    icon: BookOpen,
    description: "Reflection & growth",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserIcon,
    description: "NPR & preferences",
    color: "from-indigo-500 to-purple-500"
  }
];

const roleSpecificItems = {
  professional: [
    {
      id: "fsone",
      label: "FS:One™ Portal",
      icon: Briefcase,
      description: "Professional tools",
      color: "from-teal-500 to-cyan-500",
      badge: "Pro"
    }
  ],
  educator: [
    {
      id: "classroom",
      label: "Classroom",
      icon: GraduationCap,
      description: "Teaching tools",
      color: "from-amber-500 to-yellow-500"
    }
  ],
  learner: []
};

export function Navigation({ currentUser, onNavigate, currentSection, onLogout }: NavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const roleItems = roleSpecificItems[currentUser.role] || [];
  const allItems = [...navigationItems, ...roleItems];

  return (
    <motion.nav 
      className="h-full akilii-glass-premium border-r border-white/20 flex flex-col relative overflow-hidden"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-akilii-teal/10 to-akilii-purple/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-tr from-akilii-pink/10 to-akilii-yellow/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header Section */}
      <motion.div 
        className="p-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="relative">
          <AnimatedAkiliiLogoAdvanced 
            size="md" 
            animated={true} 
            showTagline={false}
            className="mb-4" 
          />
          
          {/* Premium Gradient Divider */}
          <motion.div
            className="relative h-px w-full mb-4 overflow-hidden"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
          >
            {/* Animated gradient line */}
            <motion.div
              className="absolute inset-0 h-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #ff6b9d 20%, #4ecdc4 40%, #ffe66d 60%, #ff8c42 80%, transparent 100%)',
                backgroundSize: '200% 100%'
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Enhanced glow effect */}
            <motion.div
              className="absolute inset-0 h-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 107, 157, 0.3) 20%, rgba(78, 205, 196, 0.3) 40%, rgba(255, 230, 109, 0.3) 60%, rgba(255, 140, 66, 0.3) 80%, transparent 100%)',
                backgroundSize: '150% 100%',
                filter: 'blur(2px)'
              }}
              animate={{
                backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 h-full"
              style={{
                background: 'linear-gradient(90deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)',
                backgroundSize: '50% 100%'
              }}
              animate={{
                backgroundPosition: ['-50% 50%', '150% 50%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </motion.div>
        </div>

        {/* User Info Card */}
        <motion.div 
          className="akilii-glass-elevated rounded-2xl p-4 border border-white/20"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 akilii-gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white font-bold text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="akilii-gradient-text font-semibold text-sm text-truncate">
                {currentUser.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs akilii-gradient-accent text-white border-0 px-2 py-0.5 capitalize">
                  {currentUser.role}
                </Badge>
                {currentUser.nprProfile && (
                  <Badge className="text-xs akilii-glass text-white border-white/20 px-2 py-0.5">
                    <Brain className="h-3 w-3 mr-1" />
                    NPR
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <Separator className="bg-white/10 mx-4" />

      {/* Navigation Items */}
      <motion.div 
        className="flex-1 p-4 space-y-2 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {allItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <motion.button
                onClick={() => onNavigate(item.id)}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                className={`
                  w-full p-3 rounded-xl transition-all duration-200 relative group text-left
                  ${isActive 
                    ? 'akilii-glass-premium border border-white/30 shadow-lg' 
                    : 'hover:akilii-glass-elevated hover:border-white/20 border border-transparent'
                  }
                `}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 akilii-gradient-primary rounded-r-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Background gradient on hover/active */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-5 rounded-xl`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 0.1 : 0.05 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3 relative z-10">
                  <motion.div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      isActive ? 'akilii-gradient-primary' : 'akilii-glass group-hover:akilii-glass-elevated'
                    }`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm transition-colors duration-200 ${
                      isActive ? 'akilii-gradient-text' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs transition-colors duration-200 ${
                      isActive ? 'text-white/70' : 'text-white/50 group-hover:text-white/60'
                    }`}>
                      {item.description}
                    </div>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <Badge className="text-xs akilii-gradient-accent text-white border-0 px-2 py-0.5 flex-shrink-0">
                      {item.badge}
                    </Badge>
                  )}

                  {/* Arrow indicator */}
                  <motion.div
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                    }`}
                    animate={{ x: isHovered ? 3 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      <Separator className="bg-white/10 mx-4" />

      {/* Footer Section */}
      <motion.div 
        className="p-4 space-y-3 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {/* Settings */}
        <motion.button
          onClick={() => onNavigate('settings')}
          className={`
            w-full p-3 rounded-xl transition-all duration-200 text-left group
            ${currentSection === 'settings' 
              ? 'akilii-glass-premium border border-white/30' 
              : 'hover:akilii-glass-elevated border border-transparent hover:border-white/20'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 akilii-glass rounded-lg flex items-center justify-center group-hover:akilii-glass-elevated">
              <Settings className="h-4 w-4 text-white/70 group-hover:text-white" />
            </div>
            <span className="text-white/80 group-hover:text-white font-medium text-sm">
              Settings
            </span>
          </div>
        </motion.button>

        {/* Logout */}
        <motion.button
          onClick={onLogout}
          className="w-full p-3 rounded-xl hover:akilii-glass-elevated border border-transparent hover:border-red-400/30 transition-all duration-200 text-left group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 akilii-glass rounded-lg flex items-center justify-center group-hover:bg-red-500/20">
              <LogOut className="h-4 w-4 text-white/70 group-hover:text-red-400" />
            </div>
            <span className="text-white/80 group-hover:text-red-400 font-medium text-sm">
              Sign Out
            </span>
          </div>
        </motion.button>

        {/* FullSpektrum Branding - Subtle Footer */}
        <motion.div
          className="pt-2 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <FullSpektrumWatermark className="justify-center" />
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}