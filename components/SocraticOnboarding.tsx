import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Check, Target, MessageSquare, Lightbulb, Palette, Wifi, WifiOff } from 'lucide-react';
import { AnimatedAkiliiLogo } from './AnimatedAkiliiLogo';
import { ThemeToggle } from './ThemeToggle';
import { PremiumBackgroundElements } from './PremiumBackgroundElements';
import { NetworkStatus } from './NetworkStatus';
import { nprService } from '../utils/nprService';
import { OnboardingStep, AuthUser, NPRUserProfile } from '../utils/nprTypes';

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    type: 'goal',
    question: "To start, what is the single most important thing you'd like my help with?",
    placeholder: "e.g., improve my focus, learn new skills, manage stress better..."
  },
  {
    id: 2,
    type: 'challenge',
    question: "That's a great goal. When you think about achieving it, what's the biggest challenge that usually gets in your way?",
    placeholder: "e.g., lack of time, getting distracted, overthinking..."
  },
  {
    id: 3,
    type: 'strength',
    question: "I understand. Now, what's a personal strength you have that could help you with that challenge?",
    placeholder: "e.g., I'm persistent, good at planning, creative problem solver..."
  },
  {
    id: 4,
    type: 'comm_preference',
    question: "When we work together, what style do you prefer?",
    options: [
      {
        value: 'direct',
        label: 'Direct Guidance',
        description: 'Clear, step-by-step instructions and practical advice'
      },
      {
        value: 'analogical',
        label: 'Analogies & Examples',
        description: 'Stories, metaphors, and creative explanations'
      }
    ]
  }
];

interface SocraticOnboardingProps {
  user: AuthUser;
  onComplete: (user: AuthUser, nprProfile: NPRUserProfile) => void;
}

export function SocraticOnboarding({ user, onComplete }: SocraticOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedEntries, setSavedEntries] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNetworkStatus, setShowNetworkStatus] = useState(false);

  React.useEffect(() => {
    // Set user context for NPR service
    nprService.setUserId(user.id);

    // Monitor network status
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkStatus(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNetworkStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user.id]);

  const handleRetryConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to reconnect by fetching a simple endpoint
      await fetch('/manifest.json', { cache: 'no-cache' });
      setIsOnline(true);
      setShowNetworkStatus(false);
      
      // If we have unsaved responses, try to process them
      if (Object.keys(responses).length > savedEntries.length) {
        await retryUnsavedSteps();
      }
    } catch (error) {
      setError('Still unable to connect. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const retryUnsavedSteps = async () => {
    const unsavedTypes = Object.keys(responses).filter(type => !savedEntries.includes(type));
    
    for (const type of unsavedTypes) {
      if (type !== 'comm_preference') {
        try {
          const result = await nprService.saveNPREntry(user.id, type, responses[type]);
          if (result.success) {
            setSavedEntries(prev => [...prev, type]);
          }
        } catch (error) {
          console.warn(`Failed to retry save for ${type}:`, error);
        }
      }
    }
  };

  const handleStepSubmit = async () => {
    if (!currentInput.trim() && !onboardingSteps[currentStep].options) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const step = onboardingSteps[currentStep];
      const value = step.options ? currentInput : currentInput.trim();
      
      setResponses(prev => ({ ...prev, [step.type]: value }));

      // Add NPR entry for non-preference steps
      if (step.type !== 'comm_preference') {
        console.log(`Saving ${step.type} entry:`, value);
        
        const result = await nprService.saveNPREntry(user.id, step.type, value, {
          step: currentStep + 1,
          onboarding: true,
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
          setSavedEntries(prev => [...prev, step.type]);
          
          if (result.offline) {
            setShowNetworkStatus(true);
            setError('Response saved offline - will sync when connection is restored');
          }
        } else {
          // Still allow progression if it's a network error
          if (result.isRetryable || !isOnline) {
            setError(result.error || 'Connection issue - response saved locally');
            setShowNetworkStatus(true);
          } else {
            setError(result.error || 'Failed to save response');
            setIsLoading(false);
            return;
          }
        }
      }

      // Handle final step - communication preference and profile completion
      if (currentStep === onboardingSteps.length - 1) {
        console.log('Completing onboarding with preferences:', value);
        
        try {
          // Create a comprehensive NPR profile with all collected data
          const profileData = {
            id: user.id,
            user_id: user.id,
            entries: {
              goal: responses.goal ? { id: `goal-${Date.now()}`, type: 'goal', content: responses.goal, timestamp: new Date() } : null,
              challenge: responses.challenge ? { id: `challenge-${Date.now()}`, type: 'challenge', content: responses.challenge, timestamp: new Date() } : null,
              strength: responses.strength ? { id: `strength-${Date.now()}`, type: 'strength', content: responses.strength, timestamp: new Date() } : null,
              preference: { id: `pref-${Date.now()}`, type: 'comm_preference', content: value, timestamp: new Date() },
              allEntries: []
            },
            profile: {
              id: `profile-${Date.now()}`,
              user_id: user.id,
              comm_preference: value as 'direct' | 'analogical',
              created_at: new Date(),
              updated_at: new Date()
            },
            psychometric_battery: {
              completion_status: {
                cognitive_assessment: false,
                personality_profile: false,
                emotional_intelligence: false,
                standardized_assessments: false
              },
              last_assessment_date: null,
              next_scheduled_assessment: null
            },
            verification: {
              is_verified: false,
              last_verification_date: new Date(),
              merkle_root_hash: null,
              integrity_status: 'pending' as const
            }
          };

          // Build allEntries array from individual entries
          if (profileData.entries.goal) profileData.entries.allEntries.push(profileData.entries.goal);
          if (profileData.entries.challenge) profileData.entries.allEntries.push(profileData.entries.challenge);
          if (profileData.entries.strength) profileData.entries.allEntries.push(profileData.entries.strength);
          if (profileData.entries.preference) profileData.entries.allEntries.push(profileData.entries.preference);

          console.log('Created profile data:', profileData);
          
          // Complete onboarding
          onComplete(user, profileData as NPRUserProfile);
          
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          
          // Create a basic fallback profile
          const fallbackProfile: NPRUserProfile = {
            id: user.id,
            user_id: user.id,
            entries: {
              goal: responses.goal ? { id: 'goal-fallback', type: 'goal', content: responses.goal, timestamp: new Date() } : null,
              challenge: responses.challenge ? { id: 'challenge-fallback', type: 'challenge', content: responses.challenge, timestamp: new Date() } : null,
              strength: responses.strength ? { id: 'strength-fallback', type: 'strength', content: responses.strength, timestamp: new Date() } : null,
              preference: { id: 'pref-fallback', type: 'comm_preference', content: value, timestamp: new Date() },
              allEntries: []
            },
            profile: {
              id: 'profile-fallback',
              user_id: user.id,
              comm_preference: value as 'direct' | 'analogical',
              created_at: new Date(),
              updated_at: new Date()
            },
            psychometric_battery: {
              completion_status: {
                cognitive_assessment: false,
                personality_profile: false,
                emotional_intelligence: false,
                standardized_assessments: false
              },
              last_assessment_date: null,
              next_scheduled_assessment: null
            },
            verification: {
              is_verified: false,
              last_verification_date: new Date(),
              merkle_root_hash: null,
              integrity_status: 'pending'
            }
          };

          console.log('Using fallback profile');
          onComplete(user, fallbackProfile);
        }
      } else {
        // Move to next step
        setCurrentStep(prev => prev + 1);
        setCurrentInput('');
        // Clear error after successful progression
        setTimeout(() => setError(null), 2000);
      }
    } catch (error) {
      console.error('Step submission error:', error);
      setError('Network error saving response. Your data has been saved locally.');
      setShowNetworkStatus(true);
      
      // Still allow progression for network errors
      if (currentStep < onboardingSteps.length - 1) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setCurrentInput('');
        }, 2000);
      } else {
        // On final step, complete with offline profile
        setTimeout(() => {
          const offlineProfile: NPRUserProfile = {
            id: user.id,
            user_id: user.id,
            entries: {
              goal: responses.goal ? { id: 'goal-offline', type: 'goal', content: responses.goal, timestamp: new Date() } : null,
              challenge: responses.challenge ? { id: 'challenge-offline', type: 'challenge', content: responses.challenge, timestamp: new Date() } : null,
              strength: responses.strength ? { id: 'strength-offline', type: 'strength', content: responses.strength, timestamp: new Date() } : null,
              preference: { id: 'pref-offline', type: 'comm_preference', content: currentInput, timestamp: new Date() },
              allEntries: []
            },
            profile: {
              id: 'profile-offline',
              user_id: user.id,
              comm_preference: currentInput as 'direct' | 'analogical',
              created_at: new Date(),
              updated_at: new Date()
            },
            psychometric_battery: {
              completion_status: {
                cognitive_assessment: false,
                personality_profile: false,
                emotional_intelligence: false,
                standardized_assessments: false
              },
              last_assessment_date: null,
              next_scheduled_assessment: null
            },
            verification: {
              is_verified: false,
              last_verification_date: new Date(),
              merkle_root_hash: null,
              integrity_status: 'pending'
            }
          };
          
          onComplete(user, offlineProfile);
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setCurrentInput('');
      setError(null);
    }
  };

  const handleOptionSelect = (value: string) => {
    setCurrentInput(value);
  };

  const isStepComplete = () => {
    if (onboardingSteps[currentStep]?.options) {
      return currentInput !== '';
    }
    return currentInput.trim().length > 0;
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <PremiumBackgroundElements />
      
      {/* Network Status */}
      {showNetworkStatus && (
        <NetworkStatus onRetry={handleRetryConnection} />
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto px-6"
      >
        <div className="akilii-glass-premium rounded-3xl border border-border/30 overflow-hidden">
          
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between p-6 border-b border-border/30"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AnimatedAkiliiLogo size="md" animated={true} />
            
            <div className="flex items-center gap-4">
              {/* Connection indicator */}
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isOnline ? 'Online' : 'Offline'} />
              
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {onboardingSteps.length}
              </span>
              <ThemeToggle size="sm" />
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full akilii-gradient-animated-button"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Welcome Message */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 text-center"
            >
              <h1 className="text-2xl font-black text-foreground mb-3">
                Welcome, {user.user_metadata?.full_name || 'there'}!
              </h1>
              <p className="text-muted-foreground mb-4">
                Let's create your personalized cognitive profile so I can provide the most helpful guidance for your unique mind.
              </p>
              {!isOnline && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm">
                  <WifiOff className="h-4 w-4" />
                  Working offline
                </div>
              )}
            </motion.div>
          )}

          {/* Question */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-6"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 akilii-gradient-animated-button rounded-xl flex items-center justify-center flex-shrink-0">
                {step.type === 'goal' && <Target className="h-5 w-5 text-primary-foreground" />}
                {step.type === 'challenge' && <MessageSquare className="h-5 w-5 text-primary-foreground" />}
                {step.type === 'strength' && <Lightbulb className="h-5 w-5 text-primary-foreground" />}
                {step.type === 'comm_preference' && <Palette className="h-5 w-5 text-primary-foreground" />}
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {step.question}
                </h2>
              </div>
            </div>

            {/* Input */}
            {step.options ? (
              // Multiple choice options
              <div className="space-y-3">
                {step.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 border ${
                      currentInput === option.value
                        ? 'akilii-glass-premium border-primary/50 ring-2 ring-primary/20'
                        : 'akilii-glass border-border/50 hover:akilii-glass-elevated hover:border-border'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          currentInput === option.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {currentInput === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">
                          {option.label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              // Text input
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={step.placeholder}
                className="w-full p-4 rounded-xl akilii-glass border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none h-24 transition-all duration-300"
                autoFocus
              />
            )}
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mx-6 mb-4 p-3 rounded-xl akilii-glass border ${
                  error.includes('offline') || error.includes('locally') 
                    ? 'border-orange-500/50 bg-orange-500/10' 
                    : 'border-destructive/50 bg-destructive/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {error.includes('offline') || error.includes('locally') ? (
                    <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  ) : null}
                  <p className={`text-sm ${
                    error.includes('offline') || error.includes('locally')
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-destructive'
                  }`}>
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="p-6 border-t border-border/30 flex items-center gap-3">
            {currentStep > 0 && (
              <motion.button
                onClick={handleBack}
                className="px-4 py-2 akilii-glass border border-border/50 text-muted-foreground hover:text-foreground hover:akilii-glass-elevated rounded-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>
            )}
            
            <motion.button
              onClick={handleStepSubmit}
              disabled={!isStepComplete() || isLoading}
              className="flex-1 py-3 px-4 akilii-gradient-animated-button text-primary-foreground font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: !isStepComplete() || isLoading ? 1 : 1.02 }}
              whileTap={{ scale: !isStepComplete() || isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : currentStep === onboardingSteps.length - 1 ? (
                <>
                  Complete Profile
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}