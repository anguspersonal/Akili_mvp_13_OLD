import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Activity, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { AnimatedAkiliiLogo } from './components/AnimatedAkiliiLogo';
import { ThemeToggle } from './components/ThemeToggle';
import { PremiumBackgroundElements } from './components/PremiumBackgroundElements';
import { AuthScreen } from './components/AuthScreen';
import { SocraticOnboarding } from './components/SocraticOnboarding';
import { NPRAIChatInterface } from './components/interfaces/NPRAIChatInterface';
import { GoalSettingInterface } from './components/interfaces/GoalSettingInterface';
import { MoodCheckInterface } from './components/interfaces/MoodCheckInterface';
import { NPRDailyTasksInterface } from './components/interfaces/NPRDailyTasksInterface';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { UserMenu } from './components/UserMenu';
import { StatsDashboard } from './components/StatsDashboard';
import { MobileNavigation } from './components/MobileNavigation';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveButton, ResponsiveText, FullScreenContainer } from './components/ResponsiveContainer';
import { PWAUtilities } from './components/PWAUtilities';
import { NetworkIndicator } from './components/NetworkStatus';
import { AuthUser, NPRUserProfile, NPRTask } from './utils/nprTypes';
import { nprService } from './utils/nprService';
import { CurrentView, createQuickActions } from './utils/appConstants';
import { 
  getPersonalizedGreeting, 
  getPersonalizedSubtext, 
  checkExistingSession, 
  checkForExistingProfile, 
  handleSignOut, 
  loadUserData, 
  generateFirstTaskForUser 
} from './utils/appHelpers';

function App() {
  // PWA and responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Start directly with auth screen - no automatic session check
  const [currentView, setCurrentView] = useState<CurrentView>('auth');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [nprProfile, setNprProfile] = useState<NPRUserProfile | null>(null);
  const [tasks, setTasks] = useState<NPRTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Responsive detection with iPhone 16 optimization
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      
      // iPhone 16 viewport height fix
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--dvh', `${vh}px`);
      };
      
      setVH();
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Initial call
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // PWA meta tags and manifest - iPhone 16 optimized
  useEffect(() => {
    // Update viewport for iPhone 16
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no, maximum-scale=1.0, minimum-scale=1.0, interactive-widget=resizes-content');
    }

    // Add manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // Add theme color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#4ecdc4';
    document.head.appendChild(themeColor);

    // Add apple touch icons
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/icon-192x192.png';
    document.head.appendChild(appleTouchIcon);

    // PWA display mode for iPhone 16
    const standaloneMode = document.createElement('meta');
    standaloneMode.name = 'apple-mobile-web-app-capable';
    standaloneMode.content = 'yes';
    document.head.appendChild(standaloneMode);

    const statusBarStyle = document.createElement('meta');
    statusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
    statusBarStyle.content = 'black-translucent';
    document.head.appendChild(statusBarStyle);

    return () => {
      document.head.removeChild(manifestLink);
      document.head.removeChild(themeColor);
      document.head.removeChild(appleTouchIcon);
      document.head.removeChild(standaloneMode);
      document.head.removeChild(statusBarStyle);
    };
  }, []);

  // Auth state change listener
  useEffect(() => {
    let mounted = true;
    
    const setupAuthListener = async () => {
      try {
        const { getSupabaseClient } = await import('./utils/supabase/client');
        const supabase = getSupabaseClient();
        
        // Listen to auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (event === 'SIGNED_IN' && session?.user) {
            const authUser = session.user as AuthUser;
            setUser(authUser);
            nprService.setAccessToken(session.access_token);
            
            // Check for existing profile
            const nprResult = await nprService.getNPRProfile(authUser.id);
            if (nprResult.success && nprResult.profile && nprResult.profile.entries.goal) {
              setNprProfile(nprResult.profile);
              setCurrentView('home');
            } else {
              setCurrentView('onboarding');
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setNprProfile(null);
            setTasks([]);
            nprService.setAccessToken('');
            nprService.setUserId('');
            setCurrentView('auth');
          }
        });

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user as AuthUser;
          setUser(authUser);
          nprService.setAccessToken(session.access_token);
          
          const nprResult = await nprService.getNPRProfile(authUser.id);
          if (nprResult.success && nprResult.profile && nprResult.profile.entries.goal) {
            setNprProfile(nprResult.profile);
            setCurrentView('home');
          } else {
            setCurrentView('onboarding');
          }
        } else {
          setCurrentView('auth');
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth setup error:', error);
        if (mounted) {
          setCurrentView('auth');
        }
      }
    };

    setupAuthListener();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Load user data when user changes
  useEffect(() => {
    if (user && currentView === 'home') {
      loadUserData(user, nprProfile, setNprProfile, setTasks);
    }
  }, [user, currentView]);

  const handleAuthSuccess = (authenticatedUser: AuthUser, isNewUser: boolean) => {
    setUser(authenticatedUser);
    
    if (isNewUser) {
      setCurrentView('onboarding');
    } else {
      checkForExistingProfile(authenticatedUser, setNprProfile, setCurrentView);
    }
  };

  const handleOnboardingComplete = (completedUser: AuthUser, completedProfile: NPRUserProfile) => {
    setUser(completedUser);
    setNprProfile(completedProfile);
    setCurrentView('home');
    
    setTimeout(() => {
      generateFirstTaskForUser(setTasks);
    }, 1000);
  };

  const onSignOut = () => {
    handleSignOut(setIsSigningOut, setShowUserMenu, setUser, setNprProfile, setTasks, setCurrentView);
  };

  const quickActions = createQuickActions(nprProfile, tasks, { setCurrentView });

  // Show loading screen only if explicitly loading
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <FullScreenContainer className="bg-background overflow-x-hidden">
      <PWAUtilities />
      <NetworkIndicator />
      
      <AnimatePresence mode="wait">
        {/* Authentication Screen - iPhone 16 Optimized */}
        {currentView === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {/* Onboarding Screen - iPhone 16 Optimized */}
        {currentView === 'onboarding' && user && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <SocraticOnboarding 
              user={user}
              onComplete={handleOnboardingComplete} 
            />
          </motion.div>
        )}

        {/* Premium Main App Interface - iPhone 16 Mobile First */}
        {currentView === 'home' && user && nprProfile && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-full"
            style={{
              minHeight: '100vh',
              minHeight: '100dvh'
            }}
          >
            <PremiumBackgroundElements />
            
            {/* Mobile Navigation - iPhone 16 Optimized */}
            {isMobile && (
              <MobileNavigation
                currentView={currentView}
                setCurrentView={setCurrentView}
                user={user}
                nprProfile={nprProfile}
                onSignOut={onSignOut}
              />
            )}

            {/* Desktop Header - Hidden on Mobile */}
            {!isMobile && (
              <motion.header 
                className="akilii-glass-premium border-b border-border/20 relative z-10"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <div className="max-w-7xl mx-auto px-6 py-6">
                  <div className="flex items-center justify-between">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <AnimatedAkiliiLogo size="lg" animated={true} />
                    </motion.div>
                    
                    <div className="flex items-center gap-8">
                      <UserMenu
                        user={user}
                        nprProfile={nprProfile}
                        showUserMenu={showUserMenu}
                        setShowUserMenu={setShowUserMenu}
                        isSigningOut={isSigningOut}
                        onSignOut={onSignOut}
                      />
                      
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <ThemeToggle size="sm" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.header>
            )}

            {/* iPhone 16 Responsive Main Content */}
            <ResponsiveContainer fullHeight={true}>
              
              {/* World-Class Greeting Section - iPhone 16 Optimized */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 sm:mb-8 lg:mb-16 text-center"
              >
                <div className="max-w-4xl mx-auto">
                  <ResponsiveText 
                    variant="display"
                    className="text-foreground mb-3 sm:mb-4 lg:mb-6 leading-tight"
                  >
                    {getPersonalizedGreeting(user, nprProfile)}
                  </ResponsiveText>
                  
                  <ResponsiveText 
                    variant="body"
                    className="akilii-two-tone-text-subtle leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8"
                  >
                    {getPersonalizedSubtext(nprProfile)}
                  </ResponsiveText>
                  
                  <motion.div
                    className="w-12 sm:w-16 lg:w-24 h-1 akilii-gradient-animated-button rounded-full mx-auto"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: isMobile ? 48 : 96, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </div>
              </motion.section>

              {/* Premium Actions Grid - iPhone 16 Mobile First */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6 sm:mb-8 lg:mb-16"
              >
                <ResponsiveGrid 
                  columns={{ mobile: 1, tablet: 2, desktop: 4 }}
                  gap="gap-3 sm:gap-4 lg:gap-6"
                >
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.6 + (index * 0.1),
                        ease: "easeOut"
                      }}
                    >
                      <ResponsiveCard 
                        padding="md"
                        className="group relative overflow-hidden cursor-pointer"
                        onClick={action.action}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-500 backdrop-blur-sm">
                              <action.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {action.isEnhanced && (
                                <motion.div 
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                                />
                              )}
                              {action.isPremium && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
                                >
                                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                          
                          <ResponsiveText 
                            variant="title"
                            className="text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300"
                          >
                            {action.title}
                          </ResponsiveText>
                          
                          <ResponsiveText 
                            variant="caption"
                            className="akilii-two-tone-text-subtle group-hover:text-foreground transition-colors duration-300 leading-relaxed"
                          >
                            {action.description}
                          </ResponsiveText>
                        </div>
                      </ResponsiveCard>
                    </motion.div>
                  ))}
                </ResponsiveGrid>
              </motion.section>

              {/* Premium Profile Summary - iPhone 16 Mobile Optimized */}
              {nprProfile.entries.goal && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-6 sm:mb-8 lg:mb-16"
                >
                  <ResponsiveCard padding="lg" className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-2xl akilii-gradient-animated-button flex items-center justify-center">
                          <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <ResponsiveText variant="heading" className="text-foreground">
                            Cognitive Profile
                          </ResponsiveText>
                          <ResponsiveText variant="caption" className="akilii-two-tone-text-subtle">
                            Your personalized NPR insights
                          </ResponsiveText>
                        </div>
                      </div>
                      
                      <ResponsiveGrid 
                        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                        gap="gap-3 sm:gap-4 lg:gap-6"
                        className="mb-4 sm:mb-6 lg:mb-8"
                      >
                        <motion.div 
                          className="space-y-2 sm:space-y-3 lg:space-y-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            </div>
                            <ResponsiveText variant="body" className="font-bold text-foreground">
                              Goal
                            </ResponsiveText>
                          </div>
                          <ResponsiveText variant="caption" className="akilii-two-tone-text leading-relaxed pl-8 sm:pl-11">
                            {nprProfile.entries.goal.content}
                          </ResponsiveText>
                        </motion.div>
                        
                        {nprProfile.entries.challenge && (
                          <motion.div 
                            className="space-y-2 sm:space-y-3 lg:space-y-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                              </div>
                              <ResponsiveText variant="body" className="font-bold text-foreground">
                                Challenge
                              </ResponsiveText>
                            </div>
                            <ResponsiveText variant="caption" className="akilii-two-tone-text leading-relaxed pl-8 sm:pl-11">
                              {nprProfile.entries.challenge.content}
                            </ResponsiveText>
                          </motion.div>
                        )}
                        
                        {nprProfile.entries.strength && (
                          <motion.div 
                            className="space-y-2 sm:space-y-3 lg:space-y-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              </div>
                              <ResponsiveText variant="body" className="font-bold text-foreground">
                                Strength
                              </ResponsiveText>
                            </div>
                            <ResponsiveText variant="caption" className="akilii-two-tone-text leading-relaxed pl-8 sm:pl-11">
                              {nprProfile.entries.strength.content}
                            </ResponsiveText>
                          </motion.div>
                        )}
                      </ResponsiveGrid>
                      
                      {nprProfile.profile?.comm_preference && (
                        <motion.div 
                          className="pt-4 sm:pt-6 lg:pt-8 border-t border-border/30"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.4 }}
                        >
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                              <span className="akilii-two-tone-text-subtle">Communication Style:</span>
                            </div>
                            <span className="font-bold text-foreground px-3 py-1 rounded-full bg-primary/10 text-xs sm:text-sm">
                              {nprProfile.profile.comm_preference === 'direct' ? 'Direct' : 'Analogical'}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </ResponsiveCard>
                </motion.section>
              )}

              <StatsDashboard nprProfile={nprProfile} tasks={tasks} />

              {/* Enhanced AI Coming Soon Notice - iPhone 16 Mobile Optimized */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="mb-6 sm:mb-8 lg:mb-12"
              >
                <div className="max-w-2xl mx-auto text-center">
                  <ResponsiveCard 
                    padding="md"
                    hover={true}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary animate-pulse" />
                      <ResponsiveText variant="title" className="text-foreground">
                        Enhanced AI Coming Soon
                      </ResponsiveText>
                    </div>
                    <ResponsiveText variant="caption" className="akilii-two-tone-text-subtle leading-relaxed">
                      We're working on integrating advanced AI capabilities with external providers. 
                      In the meantime, enjoy our powerful NPR-enhanced AI Chat for personalized interactions.
                    </ResponsiveText>
                  </ResponsiveCard>
                </div>
              </motion.section>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Interface Views - All iPhone 16 Mobile Optimized */}
        {currentView === 'ai-chat' && user && nprProfile && (
          <motion.div
            key="ai-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <NPRAIChatInterface 
              user={user} 
              nprProfile={nprProfile}
              onBack={() => setCurrentView('home')} 
            />
          </motion.div>
        )}

        {currentView === 'tasks' && user && nprProfile && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <NPRDailyTasksInterface 
              user={user}
              nprProfile={nprProfile}
              onBack={() => setCurrentView('home')} 
            />
          </motion.div>
        )}

        {currentView === 'goals' && user && nprProfile && (
          <motion.div
            key="goals"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <GoalSettingInterface 
              user={{ 
                id: user.id, 
                name: user.user_metadata?.full_name || 'User',
                email: user.email || '',
                goals: nprProfile.entries.goal ? [nprProfile.entries.goal.content] : [],
                joinDate: new Date(),
                streak: 1,
                tasks: [],
                moodHistory: []
              }}
              onBack={() => setCurrentView('home')} 
              onUpdateUser={() => loadUserData(user, nprProfile, setNprProfile, setTasks)}
            />
          </motion.div>
        )}

        {currentView === 'mood' && user && nprProfile && (
          <motion.div
            key="mood"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <MoodCheckInterface 
              user={{ 
                id: user.id, 
                name: user.user_metadata?.full_name || 'User',
                email: user.email || '',
                goals: nprProfile.entries.goal ? [nprProfile.entries.goal.content] : [],
                joinDate: new Date(),
                streak: 1,
                tasks: [],
                moodHistory: []
              }}
              onBack={() => setCurrentView('home')} 
              onUpdateUser={() => loadUserData(user, nprProfile, setNprProfile, setTasks)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </FullScreenContainer>
  );
}

export default App;