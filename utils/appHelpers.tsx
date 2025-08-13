import { AuthUser, NPRUserProfile } from './nprTypes';
import { nprService } from './nprService';
import { CurrentView } from './appConstants';
import { getSupabaseClient } from './supabase/client';

export const getPersonalizedGreeting = (user: AuthUser | null, nprProfile: NPRUserProfile | null): string => {
  if (!user || !nprProfile) return '';
  
  const hour = new Date().getHours();
  let timeGreeting = 'Hello';
  
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';
  
  return `${timeGreeting}, ${user.user_metadata?.full_name || 'there'}`;
};

export const getPersonalizedSubtext = (nprProfile: NPRUserProfile | null): string => {
  if (!nprProfile) return 'Your cognitive companion';
  
  const goal = nprProfile.entries.goal?.content;
  if (goal) {
    return `${goal.slice(0, 60)}${goal.length > 60 ? '...' : ''}`;
  }
  
  return 'Your cognitive companion';
};

export const checkExistingSession = async (
  setUser: (user: AuthUser | null) => void,
  setNprProfile: (profile: NPRUserProfile | null) => void,
  setCurrentView: (view: CurrentView) => void,
  setIsLoading: (loading: boolean) => void
) => {
  try {
    // Use singleton Supabase client
    const supabase = getSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const authUser = session.user as AuthUser;
      setUser(authUser);
      nprService.setAccessToken(session.access_token);
      
      // Check if user has NPR profile
      const nprResult = await nprService.getNPRProfile(authUser.id);
      if (nprResult.success && nprResult.profile && nprResult.profile.entries.goal) {
        // User has completed onboarding
        setNprProfile(nprResult.profile);
        setCurrentView('home');
      } else {
        // User needs onboarding
        setCurrentView('onboarding');
      }
    } else {
      setCurrentView('auth');
    }
  } catch (error) {
    console.error('Session check error:', error);
    setCurrentView('auth');
  } finally {
    setIsLoading(false);
  }
};

export const checkForExistingProfile = async (
  authUser: AuthUser,
  setNprProfile: (profile: NPRUserProfile | null) => void,
  setCurrentView: (view: CurrentView) => void
) => {
  try {
    const nprResult = await nprService.getNPRProfile(authUser.id);
    if (nprResult.success && nprResult.profile && nprResult.profile.entries.goal) {
      // User has completed onboarding
      setNprProfile(nprResult.profile);
      setCurrentView('home');
    } else {
      // User needs onboarding
      setCurrentView('onboarding');
    }
  } catch (error) {
    console.error('Profile check error:', error);
    setCurrentView('onboarding');
  }
};

export const handleSignOut = async (
  setIsSigningOut: (signing: boolean) => void,
  setShowUserMenu: (show: boolean) => void,
  setUser: (user: AuthUser | null) => void,
  setNprProfile: (profile: NPRUserProfile | null) => void,
  setTasks: (tasks: any[]) => void,
  setCurrentView: (view: CurrentView) => void
) => {
  setIsSigningOut(true);
  setShowUserMenu(false);
  
  try {
    // Use singleton Supabase client
    const supabase = getSupabaseClient();
    
    // Clear local state
    setUser(null);
    setNprProfile(null);
    setTasks([]);
    
    // Clear NPR service state
    nprService.setAccessToken('');
    nprService.setUserId('');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    
    // Navigate to auth screen
    setCurrentView('auth');
    
  } catch (error) {
    console.error('Sign out error:', error);
  } finally {
    setIsSigningOut(false);
  }
};

export const loadUserData = async (
  user: AuthUser | null,
  nprProfile: NPRUserProfile | null,
  setNprProfile: (profile: NPRUserProfile | null) => void,
  setTasks: (tasks: any[]) => void
) => {
  if (!user) return;
  
  try {
    // Load NPR profile if not already loaded
    if (!nprProfile) {
      const nprResult = await nprService.getNPRProfile(user.id);
      if (nprResult.success && nprResult.profile) {
        setNprProfile(nprResult.profile);
      }
    }

    // Load tasks
    const tasksResult = await nprService.getTasks(user.id);
    if (tasksResult.success && tasksResult.tasks) {
      setTasks(tasksResult.tasks);
    }
  } catch (error) {
    console.error('Load user data error:', error);
  }
};

export const generateFirstTaskForUser = async (setTasks: (updateFn: (prev: any[]) => any[]) => void) => {
  try {
    const result = await nprService.generateFirstTask();
    if (result.success && result.task) {
      setTasks(prev => [result.task!, ...prev]);
    }
  } catch (error) {
    console.error('Generate first task error:', error);
  }
};