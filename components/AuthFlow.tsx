import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { RobotMascot } from './AkiliiLogo';
import { AkiliiBrand } from './AkiliiBrand';
import { LoadingScreen } from './LoadingScreen';
import { User, UserRole } from '../utils/types';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getSupabaseClient, getCurrentSession, setSession } from '../utils/supabase/client';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  RefreshCw,
  Bug,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';

interface AuthFlowProps {
  onAuthComplete: (user: User) => void;
}

type AuthMode = 'signin' | 'signup';

interface FormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface AuthError {
  error: string;
  details?: string;
  code?: number | string;
  timestamp?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  session?: any;
  error?: string;
  details?: string;
  code?: number | string;
  message?: string;
  timestamp?: string;
}

export function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    if (isHealthChecking) return; // Prevent multiple concurrent health checks
    
    setIsHealthChecking(true);
    
    try {
      console.log('🏥 Checking server health...');
      
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/health`;
      console.log('Health check URL:', healthUrl);
      
      // Create fetch request with proper headers and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`, // Include anon key for Supabase Edge Functions
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);

      console.log('Health check response status:', response.status, response.statusText);
      console.log('Health check response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const healthData = await response.json();
        console.log('✅ Server health check completed:', healthData);
        setServerStatus({
          ...healthData,
          lastChecked: new Date().toISOString(),
          connectivity: 'online'
        });
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Server health check failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        setServerStatus({ 
          status: 'error', 
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText,
          lastChecked: new Date().toISOString(),
          connectivity: 'online_with_errors'
        });
      }
    } catch (healthError: any) {
      console.error('🚨 Server health check exception:', healthError);
      
      let errorDetails = 'Unknown error';
      let connectivity = 'offline';
      
      if (healthError.name === 'AbortError') {
        errorDetails = 'Health check timed out after 10 seconds';
        connectivity = 'timeout';
      } else if (healthError.message.includes('Failed to fetch') || healthError.message.includes('NetworkError')) {
        errorDetails = 'Network connection failed - server may be offline';
        connectivity = 'offline';
      } else if (healthError.message.includes('CORS')) {
        errorDetails = 'CORS policy error - server configuration issue';
        connectivity = 'cors_error';
      } else {
        errorDetails = healthError.message;
      }
      
      setServerStatus({ 
        status: 'error', 
        error: errorDetails,
        lastChecked: new Date().toISOString(),
        connectivity
      });
    } finally {
      setIsHealthChecking(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      console.log('🔐 Checking for existing session...');
      
      // Use singleton client for session check
      const { session, error } = await getCurrentSession();
      
      if (error) {
        console.error('Session check error:', error);
        setIsInitializing(false);
        return;
      }

      if (session?.access_token) {
        console.log('🔑 Valid session found, validating with server...');
        
        // Validate session with server
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/auth/session`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            console.log('✅ User session validated successfully');
            onAuthComplete(result.user);
            return;
          }
        } else {
          console.warn('⚠️ Server session validation failed:', response.status);
        }
      } else {
        console.log('ℹ️ No existing session found');
      }
      
      setIsInitializing(false);
    } catch (error) {
      console.error('🚨 Session initialization error:', error);
      setIsInitializing(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError({ 
        error: 'Email is required',
        details: 'Please enter your email address to continue'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError({ 
        error: 'Invalid email format',
        details: 'Please enter a valid email address (e.g., user@example.com)'
      });
      return false;
    }

    if (!formData.password.trim()) {
      setError({ 
        error: 'Password is required',
        details: 'Please enter your password to continue'
      });
      return false;
    }

    if (formData.password.length < 6) {
      setError({ 
        error: 'Password too short',
        details: 'Password must be at least 6 characters long for security'
      });
      return false;
    }

    if (mode === 'signup' && !formData.name.trim()) {
      setError({ 
        error: 'Name is required',
        details: 'Please enter your full name for registration'
      });
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    
    console.log('🔐 Starting sign-in process...');

    try {
      const requestData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };
      
      console.log('📤 Sending sign-in request to server...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`, // Include anon key
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log('📥 Sign-in response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const result: AuthResponse = await response.json();
      
      console.log('📋 Sign-in result:', {
        success: result.success,
        hasUser: !!result.user,
        hasSession: !!result.session,
        error: result.error
      });

      if (!response.ok || !result.success) {
        throw new Error(result.details || result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.user || !result.session) {
        throw new Error('Invalid response from authentication server - missing user or session data');
      }

      console.log('🔄 Storing session in client...');

      // Store session in singleton Supabase client
      const { error: sessionError } = await setSession(
        result.session.access_token,
        result.session.refresh_token
      );

      if (sessionError) {
        console.error('⚠️ Session storage error:', sessionError);
        // Continue anyway as server auth was successful
      } else {
        console.log('✅ Session stored successfully');
      }

      setSuccess('Welcome back! Signing you in...');
      
      setTimeout(() => {
        console.log('🎉 Sign-in completed, transitioning to app...');
        onAuthComplete(result.user!);
      }, 1000);

    } catch (error: any) {
      console.error('🚨 Sign-in error:', error);
      
      // Parse structured error response
      let parsedError: AuthError = { 
        error: 'Sign-in failed',
        details: 'An unexpected error occurred during sign-in',
        timestamp: new Date().toISOString()
      };

      try {
        if (error.message.includes('Invalid email or password') || error.message.includes('Invalid login credentials')) {
          parsedError = {
            error: 'Invalid credentials',
            details: 'The email or password you entered is incorrect. Please check your credentials and try again.'
          };
        } else if (error.message.includes('Email not confirmed')) {
          parsedError = {
            error: 'Email not confirmed',
            details: 'Please check your email for a confirmation link before signing in.'
          };
        } else if (error.message.includes('HTTP 500')) {
          parsedError = {
            error: 'Server error',
            details: 'The authentication server is experiencing issues. Please try again in a few moments.'
          };
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          parsedError = {
            error: 'Connection error',
            details: 'Could not connect to the authentication server. Please check your internet connection and try again.'
          };
        } else {
          parsedError.details = error.message || 'Please try again or contact support if the problem persists.';
        }
      } catch (parseError) {
        console.warn('Could not parse error message:', parseError);
      }

      setError(parsedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    
    console.log('📝 Starting registration process...');

    try {
      const requestData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        name: formData.name.trim(),
        role: formData.role,
      };
      
      console.log('📤 Sending registration request to server...', {
        email: requestData.email,
        name: requestData.name,
        role: requestData.role,
        passwordLength: requestData.password.length
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`, // Include anon key
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log('📥 Registration response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      let result: AuthResponse;
      try {
        result = await response.json();
        console.log('📋 Registration result:', {
          success: result.success,
          hasUser: !!result.user,
          error: result.error,
          details: result.details,
          code: result.code
        });
      } catch (jsonError) {
        console.error('Failed to parse registration response as JSON:', jsonError);
        throw new Error(`Server returned invalid response (${response.status}): ${response.statusText}`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.details || result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Registration completed successfully');
      
      setSuccess('Account created successfully! Please sign in to continue.');
      
      // Clear form and switch to sign-in mode
      setFormData({
        email: formData.email,
        password: '',
        name: '',
        role: 'user'
      });
      
      setTimeout(() => {
        setMode('signin');
        setSuccess(null);
        console.log('🔄 Switched to sign-in mode');
      }, 2000);

    } catch (error: any) {
      console.error('🚨 Registration error:', error);
      
      // Parse structured error response
      let parsedError: AuthError = { 
        error: 'Registration failed',
        details: 'An unexpected error occurred during registration',
        timestamp: new Date().toISOString()
      };

      try {
        if (error.message.includes('Email already registered') || error.message.includes('already exists')) {
          parsedError = {
            error: 'Email already registered',
            details: 'An account with this email address already exists. Please try signing in instead, or use a different email address.'
          };
        } else if (error.message.includes('Password validation failed')) {
          parsedError = {
            error: 'Password requirements not met',
            details: 'Your password does not meet the security requirements. Please choose a stronger password.'
          };
        } else if (error.message.includes('Email validation failed')) {
          parsedError = {
            error: 'Invalid email address',
            details: 'The email address format is invalid. Please check and try again.'
          };
        } else if (error.message.includes('Server configuration error')) {
          parsedError = {
            error: 'Server configuration issue',
            details: 'The authentication service is not properly configured. Please contact support.'
          };
        } else if (error.message.includes('HTTP 500')) {
          parsedError = {
            error: 'Server error',
            details: 'The registration server is experiencing issues. Please try again in a few moments.'
          };
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          parsedError = {
            error: 'Connection error',
            details: 'Could not connect to the registration server. Please check your internet connection and try again.'
          };
        } else {
          parsedError.details = error.message || 'Please try again or contact support if the problem persists.';
        }
      } catch (parseError) {
        console.warn('Could not parse error message:', parseError);
      }

      setError(parsedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  const retryConnection = () => {
    console.log('🔄 Retrying connection...');
    setError(null);
    checkServerHealth();
  };

  const getServerStatusIcon = () => {
    if (isHealthChecking) return <Loader2 className="h-3 w-3 animate-spin" />;
    if (!serverStatus) return <Server className="h-3 w-3" />;
    
    switch (serverStatus.connectivity) {
      case 'online':
        return serverStatus.status === 'healthy' ? 
          <Wifi className="h-3 w-3 text-green-400" /> : 
          <WifiOff className="h-3 w-3 text-yellow-400" />;
      case 'offline':
      case 'timeout':
        return <WifiOff className="h-3 w-3 text-red-400" />;
      case 'cors_error':
        return <AlertCircle className="h-3 w-3 text-orange-400" />;
      default:
        return <Server className="h-3 w-3" />;
    }
  };

  const getServerStatusText = () => {
    if (isHealthChecking) return 'Checking...';
    if (!serverStatus) return 'Unknown';
    
    switch (serverStatus.connectivity) {
      case 'online':
        return serverStatus.status === 'healthy' ? 'Online' : 'Issues';
      case 'offline':
        return 'Offline';
      case 'timeout':
        return 'Timeout';
      case 'cors_error':
        return 'Config Error';
      default:
        return 'Unknown';
    }
  };

  const getServerStatusVariant = () => {
    if (isHealthChecking) return 'warning';
    if (!serverStatus) return 'error';
    
    switch (serverStatus.connectivity) {
      case 'online':
        return serverStatus.status === 'healthy' ? 'success' : 'warning';
      case 'offline':
      case 'timeout':
      case 'cors_error':
        return 'error';
      default:
        return 'error';
    }
  };

  // Show loading screen while checking session
  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 akilii-gradient-mesh opacity-60"></div>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="akilii-glass-elevated border-border/50 overflow-hidden">
            <CardHeader className="text-center space-y-4 pb-6">
              
              {/* Logo and Branding */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex justify-center">
                  <RobotMascot size="lg" animated={true} />
                </div>
                <AkiliiBrand size="md" showTagline={true} />
              </motion.div>

              {/* Enhanced Mode Toggle */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex p-1 akilii-glass rounded-lg border border-border/50"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'signin'
                      ? 'akilii-gradient-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'signup'
                      ? 'akilii-gradient-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </motion.div>

              {/* Enhanced Security and Status Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 flex-wrap"
              >
                <Badge className="text-xs akilii-glass text-foreground border-border/50 px-3 py-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Cryptographically Secure
                </Badge>
                
                <Badge 
                  className={`text-xs px-3 py-1 ${
                    getServerStatusVariant() === 'success'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                      : getServerStatusVariant() === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {getServerStatusIcon()}
                  <span className="ml-1">Server {getServerStatusText()}</span>
                </Badge>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {/* Enhanced Error/Success Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <Alert className="akilii-glass border-destructive/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-foreground">
                        <div className="space-y-2">
                          <div className="font-medium">{error.error}</div>
                          {error.details && (
                            <div className="text-sm text-muted-foreground">{error.details}</div>
                          )}
                          {error.timestamp && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(error.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                    
                    {(error.error.includes('Connection error') || error.error.includes('Server error')) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={retryConnection}
                        className="w-full"
                        disabled={isHealthChecking}
                      >
                        {isHealthChecking ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Retry Connection
                      </Button>
                    )}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="akilii-glass border-green-500/50 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-foreground">{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Authentication Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                
                {/* Name Field (Sign Up Only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name" className="text-foreground text-sm font-medium flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={isLoading}
                        className="akilii-glass border-border/50 focus:border-primary transition-colors"
                        required={mode === 'signup'}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    className="akilii-glass border-border/50 focus:border-primary transition-colors"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isLoading}
                      className="akilii-glass border-border/50 focus:border-primary transition-colors pr-10"
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Role Selection (Sign Up Only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <Label className="text-foreground text-sm font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Account Type
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['user', 'professional'] as UserRole[]).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleInputChange('role', role)}
                            disabled={isLoading}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              formData.role === role
                                ? 'akilii-gradient-primary text-primary-foreground border-transparent shadow-lg'
                                : 'akilii-glass border-border/50 text-foreground hover:border-primary/50'
                            }`}
                          >
                            {role === 'user' ? (
                              <>
                                <UserIcon className="h-4 w-4 mx-auto mb-1" />
                                Personal
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mx-auto mb-1" />
                                Professional
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Separator className="bg-border/50" />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full akilii-gradient-primary text-primary-foreground font-medium py-2.5 hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {mode === 'signin' ? (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Sign In Securely
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </>
                  )}
                </Button>
              </motion.form>

              {/* Enhanced Additional Information */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {mode === 'signin' 
                      ? "Don't have an account? " 
                      : "Already have an account? "
                    }
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setError(null);
                        setSuccess(null);
                      }}
                      disabled={isLoading}
                      className="text-primary hover:text-primary/80 font-medium underline"
                    >
                      {mode === 'signin' ? 'Sign up here' : 'Sign in here'}
                    </button>
                  </p>
                </div>

                {/* Debug Information Toggle */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Bug className="h-3 w-3 mr-1" />
                    {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                  </Button>
                </div>

                {/* Enhanced Debug Information Panel */}
                <AnimatePresence>
                  {showDebugInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 akilii-glass rounded-lg border border-border/50"
                    >
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="font-medium text-foreground mb-2">Debug Information</div>
                        <div>Project ID: {projectId}</div>
                        <div>Environment: {window.location.hostname}</div>
                        <div className="flex items-center gap-2">
                          <span>Server Status:</span>
                          {getServerStatusIcon()}
                          <span>{serverStatus?.status || 'Unknown'}</span>
                        </div>
                        <div>Connectivity: {serverStatus?.connectivity || 'Unknown'}</div>
                        {serverStatus?.lastChecked && (
                          <div>Last Checked: {new Date(serverStatus.lastChecked).toLocaleTimeString()}</div>
                        )}
                        {serverStatus?.environment && (
                          <div className="space-y-1">
                            <div className="font-medium text-foreground mt-2">Environment:</div>
                            <div>Supabase URL: {serverStatus.environment.has_supabase_url ? '✓' : '✗'}</div>
                            <div>Service Key: {serverStatus.environment.has_service_role_key ? '✓' : '✗'}</div>
                            <div>Flowise URL: {serverStatus.environment.has_flowise_url ? '✓' : '✗'}</div>
                          </div>
                        )}
                        {serverStatus?.services && (
                          <div className="space-y-1">
                            <div className="font-medium text-foreground mt-2">Services:</div>
                            <div>Database: {serverStatus.services.database}</div>
                            <div>Auth: {serverStatus.services.authentication}</div>
                            <div>AI: {serverStatus.services.flowise}</div>
                          </div>
                        )}
                        {serverStatus?.error && (
                          <div className="space-y-1">
                            <div className="font-medium text-red-400 mt-2">Error Details:</div>
                            <div className="text-red-300">{serverStatus.error}</div>
                            {serverStatus.details && (
                              <div className="text-red-300 text-xs">{serverStatus.details}</div>
                            )}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={checkServerHealth}
                          className="mt-2"
                          disabled={isHealthChecking}
                        >
                          {isHealthChecking ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Refresh Status
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Powered by Supabase • NPR-Adaptive AI • End-to-End Encrypted</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthFlow;