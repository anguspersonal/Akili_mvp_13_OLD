import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  MessageCircle, 
  CheckSquare, 
  Target, 
  Heart, 
  Home,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { AnimatedAkiliiLogo } from './AnimatedAkiliiLogo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { CurrentView } from '../utils/appConstants';
import { AuthUser, NPRUserProfile } from '../utils/nprTypes';

interface MobileNavigationProps {
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  user: AuthUser | null;
  nprProfile: NPRUserProfile | null;
  onSignOut: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  setCurrentView,
  user,
  nprProfile,
  onSignOut
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      view: 'home' as CurrentView,
      description: 'Dashboard & Overview'
    },
    {
      id: 'ai-chat',
      label: 'AI Chat',
      icon: MessageCircle,
      view: 'ai-chat' as CurrentView,
      description: 'NPR-Enhanced Conversations',
      badge: true
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      view: 'tasks' as CurrentView,
      description: 'Daily Activities'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      view: 'goals' as CurrentView,
      description: 'Goal Setting & Tracking'
    },
    {
      id: 'mood',
      label: 'Mood',
      icon: Heart,
      view: 'mood' as CurrentView,
      description: 'Emotional Check-in'
    }
  ];

  const handleNavigation = (view: CurrentView) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* iPhone 16 Optimized Mobile Header */}
      <motion.header 
        className="lg:hidden fixed top-0 left-0 right-0 z-40 akilii-glass-premium border-b border-border/20"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between px-4 py-3 min-h-[60px]">
          <AnimatedAkiliiLogo size="md" animated={true} />
          
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 h-11 w-11 touch-manipulation"
              style={{
                WebkitTapHighlightColor: 'transparent',
                minWidth: '44px',
                minHeight: '44px'
              }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* iPhone 16 Full-Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />

            {/* iPhone 16 Optimized Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-40 w-80 max-w-[85vw] akilii-glass-premium border-l border-border/20"
              style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                paddingRight: 'max(1rem, env(safe-area-inset-right))',
                height: '100vh',
                height: '100dvh'
              }}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/20 pt-20">
                  <div>
                    <h2 className="font-black text-foreground">Navigation</h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.user_metadata?.full_name || 'Welcome'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 h-11 w-11 touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      minWidth: '44px',
                      minHeight: '44px'
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Items - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleNavigation(item.view)}
                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 touch-manipulation ${
                          currentView === item.view
                            ? 'akilii-glass-elevated border border-primary/40 bg-primary/10'
                            : 'akilii-glass hover:akilii-glass-elevated border border-border/20'
                        }`}
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          minHeight: '72px'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            currentView === item.view
                              ? 'akilii-gradient-animated-button'
                              : 'bg-muted/50'
                          }`}>
                            <item.icon className={`h-6 w-6 ${
                              currentView === item.view ? 'text-white' : 'text-muted-foreground'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-base ${
                                currentView === item.view ? 'text-primary' : 'text-foreground'
                              }`}>
                                {item.label}
                              </h3>
                              {item.badge && (
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground text-left">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* User Section - Fixed at Bottom */}
                <div className="p-4 border-t border-border/20">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 akilii-glass rounded-xl">
                      <div className="w-10 h-10 rounded-full akilii-gradient-animated-button flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {user?.user_metadata?.full_name || 'User'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={onSignOut}
                      className="w-full justify-start gap-3 h-12 touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        minHeight: '48px'
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* iPhone 16 Optimized Bottom Navigation */}
      <motion.nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 akilii-glass-premium border-t border-border/20"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))'
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.view)}
              className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 touch-manipulation ${
                currentView === item.view
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                minWidth: '44px',
                minHeight: '60px',
                flex: '1'
              }}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
              
              {currentView === item.view && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 akilii-gradient-animated-button rounded-xl opacity-20"
                  initial={false}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                />
              )}

              {item.badge && currentView !== item.view && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </motion.nav>
    </>
  );
};