import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { NPRAssessment, NPRProfile } from "./NPRAssessment";
import { RobotMascot } from "./AkiliiLogo";
import { AkiliiBrand } from "./AkiliiBrand";
import { User } from "../utils/types";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useFontSize } from "./FontSizeController";
import {
  Settings,
  Brain,
  Heart,
  Users,
  Shield,
  Download,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Star,
  Target,
  Clock,
  BarChart3,
  TrendingUp,
  BookOpen,
  Palette,
  Volume2,
  Activity,
  RefreshCw,
  Save,
  X
} from "lucide-react";

interface UserProfileProps {
  user: User;
}

interface CognitiveInsights {
  learningStylesSummary: string[];
  primaryStrengths: string[];
  supportNeeds: string[];
  communicationPreference: string;
  lastAnalyzed: string;
  profileVersion?: number;
}

export function UserProfile({ user }: UserProfileProps) {
  const { fontSizeClass } = useFontSize();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingNPR, setIsEditingNPR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cognitiveInsights, setCognitiveInsights] = useState<CognitiveInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);

  // Load cognitive insights on mount
  useEffect(() => {
    if (user.nprProfile) {
      loadCognitiveInsights();
    }
  }, [user.id, user.nprProfile]);

  const loadCognitiveInsights = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/user/${user.id}/cognitive-insights`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCognitiveInsights(result.insights);
      }
    } catch (error) {
      console.error('Failed to load cognitive insights:', error);
    }
  };

  const handleNPRUpdate = async (nprProfile: NPRProfile) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/user/${user.id}/npr-profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ nprProfile }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update NPR profile');
      }

      setSuccess("NPR profile updated successfully! Your AI will adapt to your new preferences.");
      setIsEditingNPR(false);
      
      // Reload insights
      await loadCognitiveInsights();
      
      // Refresh the page to update user data
      window.location.reload();
      
    } catch (error: any) {
      console.error('NPR update error:', error);
      setError(error.message || 'Failed to update NPR profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNPR = async () => {
    if (!confirm("Are you sure you want to delete your NPR profile? This will remove all personalization and cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69/user/${user.id}/npr-profile`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete NPR profile');
      }

      setSuccess("NPR profile deleted. You can create a new one anytime.");
      setCognitiveInsights(null);
      
      // Refresh the page to update user data
      window.location.reload();
      
    } catch (error: any) {
      console.error('NPR deletion error:', error);
      setError(error.message || 'Failed to delete NPR profile');
    } finally {
      setIsLoading(false);
    }
  };

  const exportProfileData = () => {
    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      nprProfile: user.nprProfile,
      cognitiveInsights,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akilii-profile-${user.name.replace(/\s+/g, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess("Profile data exported successfully!");
  };

  // Show NPR Assessment if editing
  if (isEditingNPR) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            onClick={() => setIsEditingNPR(false)}
            className="text-white/60 hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        <NPRAssessment
          onComplete={handleNPRUpdate}
          onSkip={() => setIsEditingNPR(false)}
        />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 responsive-container ${fontSizeClass}`}>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 akilii-gradient-primary rounded-2xl flex items-center justify-center">
              <span className="text-white font-black text-2xl">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            {user.nprProfile && (
              <div className="absolute -top-1 -right-1 w-6 h-6 akilii-gradient-accent rounded-full border-2 border-white flex items-center justify-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-white text-truncate">
              {user.name}
            </h1>
            <p className="text-white/80 text-fit capitalize text-truncate">
              {user.role} • {user.email}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className="text-xs akilii-glass text-white border-white/20">
                <Settings className="h-3 w-3 mr-1" />
                Profile Settings
              </Badge>
              {user.nprProfile && (
                <Badge className="text-xs akilii-gradient-accent text-white border-0">
                  <Brain className="h-3 w-3 mr-1" />
                  NPR Enabled
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportProfileData}
            className="text-white/60 hover:text-white"
            title="Export profile data"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {user.nprProfile && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNPR(true)}
                className="text-white/60 hover:text-white"
                title="Edit NPR profile"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteNPR}
                className="text-white/60 hover:text-red-400"
                title="Delete NPR profile"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="akilii-glass border-red-400/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="akilii-glass border-green-400/30">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-white">{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="akilii-glass border border-white/20 p-1">
          <TabsTrigger value="overview" className="text-white data-[state=active]:akilii-gradient-primary">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          
          {user.nprProfile && (
            <>
              <TabsTrigger value="npr" className="text-white data-[state=active]:akilii-gradient-primary">
                <Brain className="h-4 w-4 mr-2" />
                NPR Profile
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-white data-[state=active]:akilii-gradient-primary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </>
          )}
          
          <TabsTrigger value="preferences" className="text-white data-[state=active]:akilii-gradient-primary">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          
          <TabsTrigger value="privacy" className="text-white data-[state=active]:akilii-gradient-primary">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Profile Summary */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Users className="h-5 w-5" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-white/60 text-fit-sm">Name:</span>
                    <p className="text-white font-medium">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-fit-sm">Email:</span>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-fit-sm">Role:</span>
                    <Badge className="ml-2 bg-blue-500/20 text-blue-300 capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-white/60 text-fit-sm">NPR Status:</span>
                    {user.nprProfile ? (
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium">Active & Personalized</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Not Set Up</span>
                      </div>
                    )}
                  </div>
                </div>

                {!user.nprProfile && (
                  <div className="pt-4 border-t border-white/10">
                    <Button
                      onClick={() => setIsEditingNPR(true)}
                      className="w-full akilii-gradient-primary text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Create NPR Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Personalization Status */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Sparkles className="h-5 w-5" />
                  AI Personalization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.nprProfile ? (
                  <>
                    <div className="flex items-center gap-2 p-3 akilii-glass rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-fit-sm">Adaptive AI Active</p>
                        <p className="text-white/70 text-xs">AI responses personalized to your cognitive style</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-fit-sm">
                        <span className="text-white/70">Learning Adaptation</span>
                        <span className="text-green-400 font-medium">98%</span>
                      </div>
                      <Progress value={98} className="h-2 bg-white/10" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-fit-sm">
                        <span className="text-white/70">Support Optimization</span>
                        <span className="text-blue-400 font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2 bg-white/10" />
                    </div>

                    {cognitiveInsights && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs">
                          Last updated: {new Date(cognitiveInsights.lastAnalyzed).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <RobotMascot size="lg" animated={false} />
                    <p className="text-white/70 mt-4 text-fit-sm">
                      Create your NPR profile to unlock personalized AI support tailored to your unique cognitive style.
                    </p>
                    <Button
                      onClick={() => setIsEditingNPR(true)}
                      className="mt-4 akilii-gradient-accent text-white"
                      size="sm"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          {user.nprProfile && cognitiveInsights && (
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Target className="h-5 w-5" />
                  Your Cognitive Profile at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Learning Styles */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Learning Styles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cognitiveInsights.learningStylesSummary.map((style) => (
                        <Badge key={style} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Top Strengths
                    </h4>
                    <div className="space-y-2">
                      {cognitiveInsights.primaryStrengths.slice(0, 3).map((strength) => (
                        <div key={strength} className="text-white/80 text-fit-sm flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-400" />
                          {strength}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Support Needs */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-400" />
                      Support Preferences
                    </h4>
                    <div className="space-y-2">
                      {cognitiveInsights.supportNeeds.slice(0, 3).map((need) => (
                        <div key={need} className="text-white/80 text-fit-sm flex items-center gap-2">
                          <Heart className="h-3 w-3 text-pink-400" />
                          {need}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NPR Profile Tab */}
        {user.nprProfile && (
          <TabsContent value="npr" className="space-y-6">
            <div className="space-y-6">
              
              {/* Profile Header */}
              <Card className="akilii-glass-elevated border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Neuropsychographic Profile
                      </h3>
                      <p className="text-white/70 text-fit-sm">
                        Your personalized cognitive map powering <AkiliiBrand size="sm" inline /> AI
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsEditingNPR(true)}
                      className="akilii-gradient-primary text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Styles */}
              <Card className="akilii-glass-elevated border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                    <BookOpen className="h-5 w-5" />
                    Learning Style Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {user.nprProfile.learningStyles.map((style) => {
                      const styleIcons = {
                        "Visual": Eye,
                        "Auditory": Volume2,
                        "Kinesthetic": Activity,
                        "Reading/Writing": Edit3
                      };
                      const StyleIcon = styleIcons[style as keyof typeof styleIcons] || BookOpen;
                      
                      return (
                        <div key={style} className="flex items-center gap-2 px-4 py-2 akilii-glass rounded-lg border border-white/20">
                          <StyleIcon className="h-4 w-4 text-white/80" />
                          <span className="text-white font-medium text-fit-sm">{style}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Neurodiversity Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <Card className="akilii-glass-elevated border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                      <Star className="h-5 w-5 text-yellow-400" />
                      Cognitive Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.nprProfile.strengths.map((strength) => (
                        <div key={strength} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                          <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                          <span className="text-white/90 text-fit-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Support Needs */}
                <Card className="akilii-glass-elevated border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                      <Heart className="h-5 w-5 text-pink-400" />
                      Support Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.nprProfile.supportNeeds.map((need) => (
                        <div key={need} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                          <Heart className="h-3 w-3 text-pink-400 flex-shrink-0" />
                          <span className="text-white/90 text-fit-sm">{need}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conditions & Challenges */}
              {(user.nprProfile.conditions.length > 0 || user.nprProfile.challenges.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {user.nprProfile.conditions.length > 0 && (
                    <Card className="akilii-glass-elevated border-white/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                          <Brain className="h-5 w-5" />
                          Neurodiversity Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {user.nprProfile.conditions.map((condition) => (
                            <div key={condition} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                              <Brain className="h-3 w-3 text-purple-400 flex-shrink-0" />
                              <span className="text-white/90 text-fit-sm">{condition}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {user.nprProfile.challenges.length > 0 && (
                    <Card className="akilii-glass-elevated border-white/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                          <Target className="h-5 w-5" />
                          Areas for Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {user.nprProfile.challenges.map((challenge) => (
                            <div key={challenge} className="flex items-center gap-2 p-2 akilii-glass rounded-lg">
                              <Target className="h-3 w-3 text-orange-400 flex-shrink-0" />
                              <span className="text-white/90 text-fit-sm">{challenge}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Insights Tab */}
        {user.nprProfile && (
          <TabsContent value="insights" className="space-y-6">
            {cognitiveInsights ? (
              <div className="space-y-6">
                
                {/* Insights Overview */}
                <Card className="akilii-glass-elevated border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                      <BarChart3 className="h-5 w-5" />
                      Cognitive Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white/70 text-fit-sm">
                        AI-generated insights based on your NPR profile
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadCognitiveInsights}
                        className="text-white/60 hover:text-white"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Preference */}
                <Card className="akilii-glass-elevated border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                      <Users className="h-5 w-5" />
                      AI Communication Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 akilii-glass rounded-lg">
                      <div className="w-10 h-10 akilii-gradient-secondary rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{cognitiveInsights.communicationPreference}</p>
                        <p className="text-white/70 text-fit-sm">
                          Your AI adapts to this communication style in all interactions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="akilii-glass-elevated border-white/20">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <BarChart3 className="h-12 w-12 text-white/40 mx-auto" />
                    <p className="text-white/70">
                      Cognitive insights are being generated from your NPR profile...
                    </p>
                    <Button
                      onClick={loadCognitiveInsights}
                      variant="ghost"
                      className="text-white/60 hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="akilii-glass-elevated border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                <Settings className="h-5 w-5" />
                Application Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* File Upload Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">File Upload Support</h4>
                    <p className="text-white/60 text-sm">Enable file uploading in chat interfaces</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">
                      {user.preferences?.enableFileUploads ? 'Enabled' : 'Disabled'}
                    </span>
                    <Badge className={user.preferences?.enableFileUploads ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {user.preferences?.enableFileUploads ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
                
                {user.preferences?.enableFileUploads && (
                  <div className="pl-4 border-l-2 border-white/10 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Max file size:</span>
                      <span className="text-white">{user.preferences?.maxFileSize || 10}MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Allowed types:</span>
                      <span className="text-white">
                        {user.preferences?.allowedFileTypes?.join(', ') || 'Images, Documents, PDFs'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Other Preferences */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Speech Input</h4>
                    <Badge className={user.preferences?.enableSpeechInput !== false ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {user.preferences?.enableSpeechInput !== false ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Streaming Responses</h4>
                    <Badge className={user.preferences?.enableStreamingResponses !== false ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {user.preferences?.enableStreamingResponses !== false ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Notifications</h4>
                    <Badge className={user.preferences?.enableNotifications !== false ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {user.preferences?.enableNotifications !== false ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Theme</h4>
                    <Badge className="bg-blue-500/20 text-blue-300 capitalize">
                      {user.preferences?.theme || 'Auto'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Alert className="akilii-glass border-yellow-400/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    Contact your administrator to modify these preferences.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="space-y-6">
            
            {/* Privacy Overview */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                  <Shield className="h-5 w-5" />
                  Privacy & Data Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 leading-relaxed text-fit-sm">
                  You have complete control over your data. Your NPR profile is encrypted, 
                  stored securely, and used only to personalize your AI experience.
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-fit-sm">Show detailed privacy information</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                    className="text-white/60 hover:text-white"
                  >
                    {showPrivacyDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <AnimatePresence>
                  {showPrivacyDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-white/10"
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Data Storage & Security</h4>
                        <ul className="space-y-2 text-white/70 text-fit-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                            All data encrypted in transit and at rest
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                            No sharing with third parties without consent
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                            You can export or delete your data anytime
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                            Regular security audits and updates
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Your Rights</h4>
                        <ul className="space-y-2 text-white/70 text-fit-sm">
                          <li className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            Right to access your data
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            Right to correct inaccurate information
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            Right to delete your profile
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            Right to data portability
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Data Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Export Data */}
              <Card className="akilii-glass-elevated border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                    <Download className="h-5 w-5" />
                    Export Your Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70 text-fit-sm">
                    Download a complete copy of your profile data in JSON format.
                  </p>
                  <Button
                    onClick={exportProfileData}
                    className="w-full akilii-gradient-primary text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Profile Data
                  </Button>
                </CardContent>
              </Card>

              {/* Delete Profile */}
              {user.nprProfile && (
                <Card className="akilii-glass-elevated border-red-400/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-fit-lg">
                      <Trash2 className="h-5 w-5" />
                      Delete NPR Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/70 text-fit-sm">
                      Permanently delete your NPR profile and all associated data.
                    </p>
                    <Button
                      onClick={handleDeleteNPR}
                      disabled={isLoading}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete NPR Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Privacy Policy Link */}
            <Card className="akilii-glass-elevated border-white/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-white/60 text-fit-sm">
                    For more information, read our{" "}
                    <button className="text-blue-400 hover:text-blue-300 underline">
                      Privacy Policy
                    </button>{" "}
                    and{" "}
                    <button className="text-blue-400 hover:text-blue-300 underline">
                      Terms of Service
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}