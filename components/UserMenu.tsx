import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Brain, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { AuthUser, NPRUserProfile } from '../utils/nprTypes';

interface UserMenuProps {
  user: AuthUser;
  nprProfile: NPRUserProfile;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  isSigningOut: boolean;
  onSignOut: () => void;
}

export function UserMenu({ 
  user, 
  nprProfile, 
  showUserMenu, 
  setShowUserMenu, 
  isSigningOut, 
  onSignOut 
}: UserMenuProps) {
  return (
    <motion.div
      className="relative"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <motion.button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-4 akilii-glass p-3 rounded-2xl border border-border/30 hover:akilii-glass-elevated transition-all duration-300"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full akilii-gradient-animated-button flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          {/* Status indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="text-left">
          <p className="font-bold text-foreground text-sm">
            {user.user_metadata?.full_name || 'User'}
          </p>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <p className="text-xs akilii-two-tone-text-subtle">
              NPR Active
            </p>
          </div>
        </div>
        
        <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* User Dropdown Menu */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 akilii-glass-premium border border-border/30 rounded-2xl shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-border/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full akilii-gradient-animated-button flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs akilii-two-tone-text-subtle">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Brain className="h-3 w-3 text-primary" />
                <span className="akilii-two-tone-text-subtle">
                  NPR Profile: {nprProfile.profile?.comm_preference === 'direct' ? 'Direct' : 'Analogical'}
                </span>
              </div>
            </div>
            
            <div className="p-2">
              <motion.button
                onClick={() => {
                  setShowUserMenu(false);
                  // Future: Add settings/profile view
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors duration-200 text-left"
                whileHover={{ x: 2 }}
                disabled
              >
                <Settings className="h-4 w-4 text-primary opacity-50" />
                <span className="text-sm text-foreground opacity-50">Profile Settings</span>
                <span className="text-xs akilii-two-tone-text-subtle ml-auto">Soon</span>
              </motion.button>
              
              <motion.button
                onClick={onSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors duration-200 text-left disabled:opacity-50"
                whileHover={{ x: 2 }}
              >
                {isSigningOut ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <LogOut className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-foreground">
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)} 
        />
      )}
    </motion.div>
  );
}