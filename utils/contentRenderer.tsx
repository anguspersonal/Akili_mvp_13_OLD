import React from 'react';
import { motion } from 'motion/react';
import { User } from './types';
import { Dashboard } from '../components/Dashboard';
import { AdaptiveDashboard } from '../components/AdaptiveDashboard';
import { UserProfile } from '../components/UserProfile';
import { UnifiedChatInterface } from '../components/UnifiedChatInterface';
import { PlanningJournal } from '../components/PlanningJournal';
import { NPRAssessment } from '../components/NPRAssessment';
import { AgentDashboard } from '../components/AgentDashboard';

interface ContentRendererProps {
  currentSection: string;
  currentUser: User;
}

export function renderContent({ currentSection, currentUser }: ContentRendererProps) {
  const renderWithTransition = (component: React.ReactNode, key: string) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      {component}
    </motion.div>
  );

  switch (currentSection) {
    case 'dashboard':
      return renderWithTransition(
        currentUser.nprProfile ? (
          <AdaptiveDashboard user={currentUser} />
        ) : (
          <Dashboard user={currentUser} />
        ),
        'dashboard'
      );

    case 'chat':
      return renderWithTransition(
        <UnifiedChatInterface 
          user={currentUser} 
          showWelcome={true}
          contextualInfo="General chat conversation with akilii™ AI assistant"
          mode="standard"
          title="AI Assistant"
          subtitle="General conversation mode"
          enableAdvancedFeatures={false}
          enableFileUploads={currentUser?.preferences?.enableFileUploads || false}
        />,
        'chat'
      );

    case 'fsone':
      return renderWithTransition(
        <UnifiedChatInterface 
          user={currentUser} 
          showWelcome={true}
          contextualInfo="FS:One™ Enhanced AI Experience - Advanced features with NPR adaptation enabled"
          mode="enhanced"
          title="FS:One™ Enhanced AI"
          subtitle="Advanced AI with real-time streaming & NPR adaptation"
          enableAdvancedFeatures={true}
          enableFileUploads={currentUser?.preferences?.enableFileUploads || false}
        />,
        'fsone'
      );

    case 'planning':
      return renderWithTransition(
        <PlanningJournal 
          user={currentUser}
          enableAIAssistance={true}
          aiContextInfo="Planning and journaling assistance with NPR-adaptive cognitive support"
        />,
        'planning'
      );

    case 'profile':
      return renderWithTransition(
        <UserProfile user={currentUser} />,
        'profile'
      );

    case 'assessment':
      return renderWithTransition(
        <NPRAssessment 
          user={currentUser}
          onComplete={(profile) => {
            console.log('NPR Assessment completed:', profile);
            // This would normally update the user profile in a real app
          }}
        />,
        'assessment'
      );

    case 'agents':
      return renderWithTransition(
        <AgentDashboard 
          user={currentUser}
          enableFlowiseIntegration={true}
        />,
        'agents'
      );

    // Additional AI-powered sections with working functionality
    case 'research':
      return renderWithTransition(
        <UnifiedChatInterface 
          user={currentUser} 
          showWelcome={true}
          contextualInfo="Research assistant mode - NPR-adaptive AI for academic and professional research queries with cognitive optimization"
          mode="enhanced"
          title="Research Assistant"
          subtitle="Academic & professional research with AI"
          enableAdvancedFeatures={true}
          enableFileUploads={currentUser?.preferences?.enableFileUploads || false}
        />,
        'research'
      );

    case 'creative':
      return renderWithTransition(
        <UnifiedChatInterface 
          user={currentUser} 
          showWelcome={true}
          contextualInfo="Creative assistant mode - NPR-adaptive AI for creative writing, brainstorming, and artistic projects optimized for user's cognitive style"
          mode="enhanced"
          title="Creative Assistant"
          subtitle="Creative writing & brainstorming with AI"
          enableAdvancedFeatures={true}
          enableFileUploads={currentUser?.preferences?.enableFileUploads || false}
        />,
        'creative'
      );

    case 'productivity':
      return renderWithTransition(
        <UnifiedChatInterface 
          user={currentUser} 
          showWelcome={true}
          contextualInfo="Productivity assistant - NPR-adaptive AI for task management, time optimization, and workflow improvement based on cognitive preferences"
          mode="standard"
          title="Productivity Assistant"
          subtitle="Task management & workflow optimization"
          enableAdvancedFeatures={true}
          enableFileUploads={currentUser?.preferences?.enableFileUploads || false}
        />,
        'productivity'
      );

    case 'learning':
      return renderWithTransition(
        <UnifiedChatInterface 
          user={currentUser} 
          showWelcome={true}
          contextualInfo="Learning assistant - NPR-adaptive educational support, study techniques, and knowledge acquisition tailored to learning style"
          mode="standard"
          title="Learning Companion"
          subtitle="Educational support & study assistance"
          enableAdvancedFeatures={true}
          enableFileUploads={currentUser?.preferences?.enableFileUploads || false}
        />,
        'learning'
      );

    // Enhanced fallback with functional mini-dashboard
    default:
      return renderWithTransition(
        <motion.div 
          className="flex items-center justify-center h-full p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="text-center space-y-6 max-w-2xl">
            
            {/* Status Icon */}
            <motion.div
              className="w-24 h-24 mx-auto akilii-gradient-primary rounded-2xl flex items-center justify-center"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <span className="text-3xl">🚀</span>
            </motion.div>
            
            {/* Section Info */}
            <div className="space-y-3">
              <h2 className="text-2xl font-black akilii-gradient-text capitalize">
                {currentSection.replace(/([A-Z])/g, ' $1').trim()} Section
              </h2>
              <p className="text-muted-foreground">
                This advanced AI section is under development with enhanced capabilities powered by Flowise.
                {currentUser.nprProfile && " It will include full NPR-adaptive features personalized for your cognitive profile."}
              </p>
              
              {/* NPR Badge if available */}
              {currentUser.nprProfile && (
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 akilii-gradient-accent rounded-lg text-primary-foreground"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm font-semibold">
                    🧠 NPR-Ready for {currentUser.nprProfile.cognitiveStyle} cognitive style
                  </span>
                </motion.div>
              )}
            </div>

            {/* Functional Preview Chat */}
            <motion.div 
              className="mt-8 w-full max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="akilii-glass-elevated rounded-2xl border border-border p-1">
                <UnifiedChatInterface 
                  user={currentUser} 
                  showWelcome={true}
                  contextualInfo={`Preview mode for ${currentSection} section - Limited functionality with NPR adaptation`}
                  className="h-96"
                  mode="compact"
                  title="Preview Mode"
                  subtitle="Limited functionality"
                  enableAdvancedFeatures={false}
                  enableFileUploads={false}
                />
              </div>
            </motion.div>

            {/* Development Status */}
            <motion.div
              className="text-xs text-muted-foreground space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <p>🔧 Full features coming soon with:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-2 py-1 akilii-glass rounded text-xs border border-border">NPR-Adaptive UI</span>
                <span className="px-2 py-1 akilii-glass rounded text-xs border border-border">Cognitive Optimization</span>
                <span className="px-2 py-1 akilii-glass rounded text-xs border border-border">Advanced AI Features</span>
                <span className="px-2 py-1 akilii-glass rounded text-xs border border-border">Real-time Analytics</span>
              </div>
            </motion.div>
          </div>
        </motion.div>,
        'default'
      );
  }
}

// Helper function to get section-specific AI context with NPR enhancement
export function getAIContextForSection(section: string, user?: User): string {
  const baseContexts: { [key: string]: string } = {
    dashboard: "User dashboard interaction - Provide insights about user's data, activities, and NPR-adaptive recommendations",
    chat: "General conversation mode - Be helpful, informative, and engaging with NPR-adaptive communication",
    fsone: "FS:One™ Enhanced AI mode - Use advanced capabilities, streaming responses, and full NPR personalization",
    planning: "Planning and journaling assistant - Help with goal setting, task planning, reflection, and cognitive optimization",
    profile: "User profile management - Assist with profile updates, NPR personalization, and cognitive preference settings",
    assessment: "NPR assessment guidance - Help users understand their cognitive profile and optimization opportunities",
    agents: "AI agent management - Assist with creating, managing, and optimizing AI agents for user's cognitive style",
    research: "Research assistant - Focus on academic and professional research with cognitive style optimization",
    creative: "Creative assistant - Support artistic and creative endeavors adapted to thinking style",
    productivity: "Productivity coach - Help optimize workflows and time management based on cognitive preferences",
    learning: "Learning companion - Educational support and study assistance tailored to learning style"
  };

  let contextString = baseContexts[section] || "General AI assistant with NPR-adaptive capabilities";
  
  // Add NPR context if available
  if (user?.nprProfile) {
    const nprDetails = [
      `Cognitive style: ${user.nprProfile.cognitiveStyle}`,
      user.nprProfile.learningPreference ? `Learning preference: ${user.nprProfile.learningPreference}` : '',
      user.nprProfile.communicationStyle ? `Communication style: ${user.nprProfile.communicationStyle}` : '',
      user.nprProfile.processingSpeed ? `Processing speed: ${user.nprProfile.processingSpeed}` : ''
    ].filter(Boolean);

    if (nprDetails.length > 0) {
      contextString += ` | NPR Profile: ${nprDetails.join(', ')}`;
    }
  }

  // Add user role context
  if (user?.role) {
    contextString += ` | User role: ${user.role}`;
  }

  return contextString;
}

// Helper function to determine if section should use enhanced mode
export function shouldUseEnhancedMode(section: string): boolean {
  const enhancedSections = ['fsone', 'research', 'creative', 'agents'];
  return enhancedSections.includes(section);
}

// Helper function to get chat mode for section
export function getChatModeForSection(section: string): 'standard' | 'enhanced' | 'compact' {
  if (shouldUseEnhancedMode(section)) {
    return 'enhanced';
  }
  return 'standard';
}

// Helper function to get chat title for section
export function getChatTitleForSection(section: string): string {
  const titles: { [key: string]: string } = {
    chat: 'AI Assistant',
    fsone: 'FS:One™ Enhanced AI',
    research: 'Research Assistant', 
    creative: 'Creative Assistant',
    productivity: 'Productivity Assistant',
    learning: 'Learning Companion',
    agents: 'Agent Dashboard'
  };
  return titles[section] || `${section.charAt(0).toUpperCase() + section.slice(1)} Assistant`;
}

// Helper function to get chat subtitle for section
export function getChatSubtitleForSection(section: string): string {
  const subtitles: { [key: string]: string } = {
    chat: 'General conversation mode',
    fsone: 'Advanced AI with real-time streaming & NPR adaptation',
    research: 'Academic & professional research with AI',
    creative: 'Creative writing & brainstorming with AI',
    productivity: 'Task management & workflow optimization',
    learning: 'Educational support & study assistance',
    agents: 'AI agent management & optimization'
  };
  return subtitles[section] || 'AI-powered assistance';
}

// Helper function to get section-specific Flowise configuration
export function getFlowiseConfigForSection(section: string, user?: User) {
  return {
    streaming: shouldUseEnhancedMode(section),
    context: getAIContextForSection(section, user),
    enhancedFeatures: shouldUseEnhancedMode(section),
    mode: getChatModeForSection(section),
    nprAdaptive: !!user?.nprProfile,
    userRole: user?.role || 'general',
    cognitiveStyle: user?.nprProfile?.cognitiveStyle || 'balanced'
  };
}

export default renderContent;