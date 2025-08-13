import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { AnimatedAkiliiLogo } from './AnimatedAkiliiLogo';
import { ThemeToggle } from './ThemeToggle';
import { PremiumBackgroundElements } from './PremiumBackgroundElements';
import { GoogleIcon } from './GoogleIcon';
import { FacebookIcon } from './FacebookIcon';
import { TwitterIcon } from './TwitterIcon';
import { getSupabaseClient } from '../utils/supabase/client';
import { nprService } from '../utils/nprService';
import { AuthUser } from '../utils/nprTypes';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser, isNewUser: boolean) => void;
}

type AuthMode = 'signin' | 'signup';
type SSOProvider = 'google' | 'facebook' | 'twitter';

interface FormData {
  email: string;
  password: string;
  fullName: string;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSSOProvider, setLoadingSSOProvider] = useState<SSOProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSSOSection, setShowSSOSection] = useState(true);
  const [disabledProviders, setDisabledProviders] = useState<Set<SSOProvider>>(new Set());

  // Use singleton Supabase client
  const supabase = getSupabaseClient();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSSOSignIn = async (provider: SSOProvider) => {
    setLoadingSSOProvider(provider);
    setError(null);

    try {
      const providerMap = {
        google: 'google',
        facebook: 'facebook', 
        twitter: 'twitter'
      } as const;

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: providerMap[provider],
        options: {
          redirectTo: `${window.location.origin}`
        }
      });

      if (authError) {
        if (authError.message.includes('provider is not enabled')) {
          // Mark this provider as disabled
          setDisabledProviders(prev => new Set([...prev, provider]));
          
          const setupUrls = {
            google: 'https://supabase.com/docs/guides/auth/social-login/auth-google',
            facebook: 'https://supabase.com/docs/guides/auth/social-login/auth-facebook',
            twitter: 'https://supabase.com/docs/guides/auth/social-login/auth-twitter'
          };
          
          // Show a brief error message and hide it after 3 seconds
          setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not available yet.`);
          setTimeout(() => setError(null), 3000);
          
          // Hide the entire SSO section if all providers are disabled
          if (disabledProviders.size === 2) { // Will be 3 after this one is added
            setTimeout(() => setShowSSOSection(false), 1000);
          }
        } else {
          setError(authError.message);
        }
        setLoadingSSOProvider(null);
        return;
      }

      // OAuth redirect will handle the rest
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      setError(`Network error during ${provider} sign-in`);
      setLoadingSSOProvider(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data.user && data.session) {
        nprService.setAccessToken(data.session.access_token);
        onAuthSuccess(data.user as AuthUser, false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Network error during sign in');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use Supabase client directly for signup instead of NPR service
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // If user is immediately confirmed (as it should be with email_confirm: true)
        if (data.session) {
          nprService.setAccessToken(data.session.access_token);
          onAuthSuccess(data.user as AuthUser, true);
        } else {
          // If for some reason there's no session, try to sign them in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });

          if (signInError) {
            setError('Account created but sign in failed. Please try signing in.');
            setIsLoading(false);
            return;
          }

          if (signInData.user && signInData.session) {
            nprService.setAccessToken(signInData.session.access_token);
            onAuthSuccess(signInData.user as AuthUser, true);
          }
        }
      } else {
        setError('Failed to create account - no user returned');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Network error during sign up');
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setError(null);
    setFormData(prev => ({ ...prev, fullName: '' }));
  };

  const isFormValid = () => {
    const { email, password, fullName } = formData;
    const emailValid = email.includes('@') && email.length > 3;
    const passwordValid = password.length >= 6;
    const nameValid = authMode === 'signin' || fullName.trim().length > 0;
    
    return emailValid && passwordValid && nameValid;
  };

  const isAnyLoading = isLoading || loadingSSOProvider !== null;

  const ssoButtons = [
    {
      provider: 'google' as SSOProvider,
      label: 'Continue with Google',
      icon: GoogleIcon
    },
    {
      provider: 'facebook' as SSOProvider,
      label: 'Continue with Facebook',
      icon: FacebookIcon
    },
    {
      provider: 'twitter' as SSOProvider,
      label: 'Continue with Twitter',
      icon: TwitterIcon
    }
  ].filter(sso => !disabledProviders.has(sso.provider));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <PremiumBackgroundElements />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xs mx-auto px-4"
      >
        <div className="akilii-glass-premium rounded-2xl border border-border/10 overflow-hidden backdrop-blur-xl">
          
          {/* Ultra-Compact Header */}
          <motion.div 
            className="text-center px-6 pt-6 pb-3"
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-3">
              <AnimatedAkiliiLogo size="md" animated={true} glowEffect={true} />
            </div>
            
            <h1 className="font-black text-foreground mb-1" style={{ fontSize: '18px', lineHeight: '22px' }}>
              {authMode === 'signin' ? 'Welcome back' : 'Join akilii™'}
            </h1>
            
            <p className="akilii-two-tone-text-subtle" style={{ fontSize: '12px', lineHeight: '16px' }}>
              {authMode === 'signin' 
                ? 'Sign in to your cognitive companion' 
                : 'AI for every unique mind'}
            </p>
          </motion.div>

          {/* Ultra-Compact Form Container */}
          <div className="px-6 pb-3">
            
            {/* Conditional SSO Buttons */}
            <AnimatePresence>
              {showSSOSection && ssoButtons.length > 0 && (
                <motion.div 
                  className="mb-4 space-y-2 flex flex-col items-center"
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {ssoButtons.map((sso, index) => {
                    const IconComponent = sso.icon;
                    const isLoading = loadingSSOProvider === sso.provider;
                    
                    return (
                      <motion.button
                        key={sso.provider}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                        onClick={() => handleSSOSignIn(sso.provider)}
                        disabled={isAnyLoading || disabledProviders.has(sso.provider)}
                        className="flex items-center justify-center gap-2.5 akilii-glass border border-border/30 rounded-lg text-foreground hover:akilii-glass-elevated hover:border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        style={{
                          width: '260px',
                          height: '36px',
                          padding: '8px 12px',
                          fontSize: '13px'
                        }}
                        whileHover={!isAnyLoading && !disabledProviders.has(sso.provider) ? { 
                          scale: 1.005,
                          y: -0.5
                        } : {}}
                        whileTap={!isAnyLoading && !disabledProviders.has(sso.provider) ? { 
                          scale: 0.995
                        } : {}}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-3.5 h-3.5 border border-muted-foreground/30 border-t-muted-foreground rounded-full"
                            />
                          ) : (
                            <IconComponent size={14} />
                          )}
                        </div>
                        
                        {/* Text */}
                        <span className="font-medium whitespace-nowrap">
                          {isLoading ? 'Signing in...' : sso.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conditional Divider - Only show if SSO buttons are visible */}
            <AnimatePresence>
              {showSSOSection && ssoButtons.length > 0 && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative mb-4"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-background text-muted-foreground akilii-glass rounded-full" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      or email
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ultra-Compact Email Form */}
            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col items-center">
              <div className="space-y-2.5 w-full flex flex-col items-center">
                
                {/* Full Name - Only for Sign Up */}
                <AnimatePresence>
                  {authMode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-center w-full"
                    >
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Full name"
                          className="akilii-glass border border-border/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                          style={{
                            width: '260px',
                            height: '36px',
                            paddingLeft: '32px',
                            paddingRight: '12px',
                            fontSize: '13px'
                          }}
                          required={authMode === 'signup'}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex justify-center w-full"
                >
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email address"
                      className="akilii-glass border border-border/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                      style={{
                        width: '260px',
                        height: '36px',
                        paddingLeft: '32px',
                        paddingRight: '12px',
                        fontSize: '13px'
                      }}
                      required
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="flex justify-center w-full"
                >
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Password"
                      className="akilii-glass border border-border/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                      style={{
                        width: '260px',
                        height: '36px',
                        paddingLeft: '32px',
                        paddingRight: '40px',
                        fontSize: '13px'
                      }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Password Requirements - Only for Sign Up */}
                <AnimatePresence>
                  {authMode === 'signup' && formData.password.length > 0 && formData.password.length < 6 && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-muted-foreground text-center"
                      style={{ 
                        width: '260px',
                        fontSize: '11px',
                        lineHeight: '14px'
                      }}
                    >
                      Password must be at least 6 characters
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-2.5 rounded-lg akilii-glass border border-destructive/30 bg-destructive/5"
                      style={{ width: '260px' }}
                    >
                      <p className="text-destructive text-center leading-tight" style={{ fontSize: '11px' }}>
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ultra-Slim Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isFormValid() || isAnyLoading}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="akilii-gradient-animated-button text-primary-foreground font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    width: '260px',
                    height: '36px',
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                  whileHover={{ scale: !isFormValid() || isAnyLoading ? 1 : 1.01 }}
                  whileTap={{ scale: !isFormValid() || isAnyLoading ? 1 : 0.99 }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3.5 h-3.5 border border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Compact Toggle Auth Mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-3 text-center"
            >
              <p className="text-muted-foreground mb-1" style={{ fontSize: '11px' }}>
                {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={toggleAuthMode}
                disabled={isAnyLoading}
                className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                style={{ fontSize: '11px' }}
              >
                {authMode === 'signin' ? 'Create one here' : 'Sign in instead'}
              </button>
            </motion.div>

            {/* Social Login Setup Notice */}
            {!showSSOSection && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2.5 akilii-glass border border-blue-500/30 bg-blue-500/5 rounded-lg"
              >
                <p className="text-blue-600 dark:text-blue-400 text-center leading-tight" style={{ fontSize: '10px' }}>
                  <strong>Demo Mode:</strong> Email sign-in only. Social login requires additional setup.
                </p>
              </motion.div>
            )}
          </div>

          {/* Ultra-Compact Footer */}
          <motion.div 
            className="px-6 py-2.5 border-t border-border/10 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <ThemeToggle size="sm" />
          </motion.div>
        </div>

        {/* Minimal Branding Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="text-center text-muted-foreground mt-3"
          style={{ fontSize: '10px' }}
        >
          AI for every unique mind
        </motion.p>
      </motion.div>
    </div>
  );
}