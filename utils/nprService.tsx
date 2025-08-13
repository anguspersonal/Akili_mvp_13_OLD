import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';
import * as kv from '../supabase/functions/server/kv_store';
import { 
  NPRUserProfile, 
  NPREntry, 
  NPRProfile, 
  NPRTask,
  NPRResponseResult,
  NPRTaskResult,
  NPRProfileResult,
  CognitiveAssessment,
  PersonalityProfile,
  EmotionalIntelligence,
  StandardizedAssessments,
  AssessmentSession,
  MerkleTree,
  CryptographicSignature
} from './nprTypes';
import { nprCryptoService } from './nprCryptoService';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Enhanced error types
interface NPRError extends Error {
  code?: string;
  isNetworkError?: boolean;
  isRetryable?: boolean;
}

class NPRService {
  private accessToken: string | null = null;
  private userId: string | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000; // Start with 1 second delay
  private offlineQueue: Array<{ method: string; data: any; timestamp: Date }> = [];

  constructor() {
    // Initialize service and check for offline data
    this.initializeOfflineSupport();
  }

  private initializeOfflineSupport() {
    // Load any pending offline data
    try {
      const offlineData = localStorage.getItem('akilii-npr-offline-queue');
      if (offlineData) {
        this.offlineQueue = JSON.parse(offlineData);
      }
    } catch (error) {
      console.warn('Could not load offline queue:', error);
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.processOfflineQueue();
    });
  }

  private async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log('Processing offline queue:', this.offlineQueue.length, 'items');
    
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    
    for (const item of queue) {
      try {
        // Attempt to process each queued item
        switch (item.method) {
          case 'saveNPREntry':
            await this.makeServerRequest('/npr/save-entry', item.data);
            break;
          case 'savePsychometricAssessment':
            await this.makeServerRequest('/npr/save-psychometric-assessment', item.data);
            break;
          default:
            console.warn('Unknown offline method:', item.method);
        }
      } catch (error) {
        // If still failing, add back to queue
        this.offlineQueue.push(item);
      }
    }

    // Update local storage
    this.updateOfflineStorage();
  }

  private updateOfflineStorage() {
    try {
      localStorage.setItem('akilii-npr-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.warn('Could not update offline storage:', error);
    }
  }

  private isOnline(): boolean {
    return navigator.onLine;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createNetworkError(message: string, originalError?: any): NPRError {
    const error = new Error(message) as NPRError;
    error.code = 'NETWORK_ERROR';
    error.isNetworkError = true;
    error.isRetryable = true;
    
    if (originalError) {
      error.stack = originalError.stack;
    }
    
    return error;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeServerRequest(endpoint: string, data: any, options: { 
    skipRetry?: boolean;
    skipOfflineQueue?: boolean;
    skipAuth?: boolean;
  } = {}): Promise<any> {
    if (!this.accessToken && !options.skipAuth) {
      throw new Error('No access token available');
    }

    // Check if we're offline
    if (!this.isOnline() && !options.skipOfflineQueue) {
      console.log('Offline detected, queuing request:', endpoint);
      this.offlineQueue.push({
        method: endpoint.split('/').pop() || 'unknown',
        data,
        timestamp: new Date()
      });
      this.updateOfflineStorage();
      
      // Return a success response for offline mode
      return { success: true, offline: true };
    }

    let lastError: any;
    
    for (let attempt = 1; attempt <= (options.skipRetry ? 1 : this.retryAttempts); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        console.log(`NPR Request attempt ${attempt}/${this.retryAttempts}:`, endpoint);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (this.accessToken && !options.skipAuth) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/make-server-feeffd69${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw this.createNetworkError(`Server request failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('NPR Request successful:', endpoint);
        return result;

      } catch (error) {
        lastError = error;
        console.error(`NPR Request attempt ${attempt} failed:`, error);

        // Check if it's a retryable error
        if (error.name === 'AbortError') {
          lastError = this.createNetworkError('Request timeout - please check your connection');
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = this.createNetworkError('Network connection failed - please check your internet connection');
        }

        // If this isn't the last attempt and the error is retryable, wait before retrying
        if (attempt < this.retryAttempts && (lastError as NPRError).isRetryable) {
          const delayTime = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Waiting ${delayTime}ms before retry...`);
          await this.delay(delayTime);
        }
      }
    }

    // All attempts failed
    throw lastError || this.createNetworkError('All retry attempts failed');
  }

  /**
   * Ensure NPR profile has proper structure
   */
  private ensureProfileStructure(profile: any): NPRUserProfile {
    // Ensure entries structure exists
    if (!profile.entries) {
      profile.entries = {
        goal: null,
        challenge: null,
        strength: null,
        preference: null,
        allEntries: []
      };
    }

    // Ensure allEntries is always an array
    if (!Array.isArray(profile.entries.allEntries)) {
      profile.entries.allEntries = [];
    }

    // Ensure psychometric_battery structure exists
    if (!profile.psychometric_battery) {
      profile.psychometric_battery = {
        completion_status: {
          cognitive_assessment: false,
          personality_profile: false,
          emotional_intelligence: false,
          standardized_assessments: false
        },
        last_assessment_date: null,
        next_scheduled_assessment: null
      };
    }

    // Ensure verification structure exists
    if (!profile.verification) {
      profile.verification = {
        is_verified: false,
        last_verification_date: null,
        merkle_root_hash: null,
        integrity_status: 'pending'
      };
    }

    return profile as NPRUserProfile;
  }

  /**
   * Save NPR Entry with enhanced error handling and offline support
   */
  async saveNPREntry(userId: string, type: string, content: string, metadata?: any): Promise<NPRResponseResult> {
    try {
      console.log('Saving NPR entry:', { userId, type, content });

      // Create cryptographic signature for entry
      const entryData = {
        type,
        content,
        timestamp: new Date(),
        metadata: metadata || {}
      };
      
      const signature = await nprCryptoService.signData(entryData);
      
      const entry: NPREntry = {
        id: `${type}-${Date.now()}`,
        ...entryData,
        signature
      };

      // Save to local storage as backup
      try {
        const localKey = `akilii-npr-entry-${userId}-${entry.id}`;
        localStorage.setItem(localKey, JSON.stringify(entry));
      } catch (storageError) {
        console.warn('Could not save to local storage:', storageError);
      }

      // Get existing profile to update Merkle tree
      const existingProfile = await this.getNPRProfile(userId);
      let merkleTree: MerkleTree | undefined;
      
      if (existingProfile.success && existingProfile.profile && existingProfile.profile.entries.allEntries) {
        const allEntries = [...existingProfile.profile.entries.allEntries, entry];
        if (allEntries.length > 0) {
          merkleTree = nprCryptoService.createMerkleTree(allEntries);
          
          // Generate Merkle proof for this entry
          entry.merkle_proof = nprCryptoService.generateMerkleProof(merkleTree, entry);
        }
      }

      const result = await this.makeServerRequest('/npr/save-entry', {
        userId,
        entry,
        merkleTree
      });

      console.log('NPR entry saved successfully:', result);

      return {
        success: true,
        entry: result.entry || entry,
        offline: result.offline
      };
    } catch (error) {
      console.error('Save NPR entry error:', error);
      
      // If it's a network error and we're offline, still return success
      if ((error as NPRError).isNetworkError && !this.isOnline()) {
        return {
          success: true,
          entry: { id: `${type}-${Date.now()}`, type, content, timestamp: new Date() },
          offline: true,
          message: 'Saved offline - will sync when connection is restored'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save entry',
        isRetryable: (error as NPRError).isRetryable
      };
    }
  }

  /**
   * Get NPR Profile with enhanced error handling
   */
  async getNPRProfile(userId: string): Promise<NPRProfileResult> {
    try {
      console.log('Getting NPR profile for:', userId);

      // Try to get from server first
      const result = await this.makeServerRequest('/npr/get-profile', { userId });
      
      if (result.profile) {
        // Ensure proper structure
        const structuredProfile = this.ensureProfileStructure(result.profile);
        
        // Verify data integrity if profile exists and has entries
        if (structuredProfile.entries.allEntries && structuredProfile.entries.allEntries.length > 0) {
          try {
            const integrityCheck = await nprCryptoService.validateDataIntegrity(structuredProfile.entries.allEntries);
            
            structuredProfile.verification = {
              is_verified: integrityCheck.isValid,
              last_verification_date: new Date(),
              merkle_root_hash: result.profile.merkleTree?.root?.hash || null,
              integrity_status: integrityCheck.isValid ? 'valid' : 'compromised'
            };
          } catch (integrityError) {
            console.warn('Integrity check failed:', integrityError);
            structuredProfile.verification = {
              is_verified: false,
              last_verification_date: new Date(),
              merkle_root_hash: null,
              integrity_status: 'pending'
            };
          }
        }
        
        return {
          success: true,
          profile: structuredProfile
        };
      } else {
        // Return a basic profile structure if none exists
        return {
          success: true,
          profile: this.ensureProfileStructure({})
        };
      }
    } catch (error) {
      console.error('Get NPR profile error:', error);
      
      // Try to get from local storage as fallback
      try {
        const localProfile = localStorage.getItem(`akilii-npr-profile-${userId}`);
        if (localProfile) {
          console.log('Using local profile fallback');
          return {
            success: true,
            profile: this.ensureProfileStructure(JSON.parse(localProfile)),
            offline: true
          };
        }
      } catch (localError) {
        console.warn('Could not get local profile:', localError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
        profile: this.ensureProfileStructure({})
      };
    }
  }

  /**
   * Save comprehensive psychometric assessment results with enhanced error handling
   */
  async savePsychometricAssessment(
    userId: string,
    cognitive: CognitiveAssessment,
    personality: PersonalityProfile,
    emotionalIntelligence: EmotionalIntelligence,
    standardized: StandardizedAssessments
  ): Promise<NPRResponseResult> {
    try {
      console.log('Saving psychometric assessment for:', userId);

      // Create comprehensive NPR profile
      const profileData = {
        id: `profile-${Date.now()}`,
        user_id: userId,
        comm_preference: this.inferCommunicationPreference(personality, cognitive),
        cognitive_assessment: cognitive,
        personality_profile: personality,
        emotional_intelligence: emotionalIntelligence,
        standardized_assessments: standardized,
        learning_history: {
          preferred_modalities: this.inferLearningModalities(personality, cognitive),
          adaptation_patterns: [],
          performance_trends: {},
          timestamp: new Date()
        },
        behavioral_patterns: {
          interaction_style: this.inferInteractionStyle(personality, emotionalIntelligence),
          engagement_level: this.calculateEngagementLevel(personality),
          persistence_level: personality.big_five.conscientiousness,
          help_seeking_behavior: this.inferHelpSeekingBehavior(personality, emotionalIntelligence),
          timestamp: new Date()
        },
        created_at: new Date(),
        updated_at: new Date()
      };

      // Save to local storage as backup
      try {
        localStorage.setItem(`akilii-npr-assessment-${userId}`, JSON.stringify(profileData));
      } catch (storageError) {
        console.warn('Could not save assessment to local storage:', storageError);
      }

      // Sign the complete profile
      const profileSignature = await nprCryptoService.signData(profileData);
      
      const profile: NPRProfile = {
        ...profileData,
        profile_signature: profileSignature
      };

      const result = await this.makeServerRequest('/npr/save-psychometric-assessment', {
        userId,
        profile
      });

      console.log('Psychometric assessment saved successfully');

      return {
        success: true,
        response: 'Psychometric assessment saved successfully',
        offline: result.offline
      };
    } catch (error) {
      console.error('Save psychometric assessment error:', error);
      
      // If it's a network error and we're offline, still return success
      if ((error as NPRError).isNetworkError && !this.isOnline()) {
        return {
          success: true,
          response: 'Assessment saved offline - will sync when connection is restored',
          offline: true
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save assessment',
        isRetryable: (error as NPRError).isRetryable
      };
    }
  }

  /**
   * Generate AI-enhanced tasks with fallback support
   */
  async generateEnhancedTasks(userId: string, nprProfile: NPRUserProfile): Promise<NPRTaskResult> {
    try {
      const tasks = await this.generatePersonalizedTasks(nprProfile);
      
      // Sign each task
      const signedTasks = await Promise.all(
        tasks.map(async (task) => ({
          ...task,
          task_signature: await nprCryptoService.signData(task)
        }))
      );

      const result = await this.makeServerRequest('/npr/generate-enhanced-tasks', {
        userId,
        profile: nprProfile,
        tasks: signedTasks
      });

      return {
        success: true,
        tasks: result.tasks || signedTasks
      };
    } catch (error) {
      console.error('Generate enhanced tasks error:', error);
      
      // Return locally generated tasks as fallback
      const fallbackTasks = await this.generatePersonalizedTasks(nprProfile);
      
      return {
        success: true,
        tasks: fallbackTasks,
        offline: true,
        message: 'Generated offline tasks - enhanced tasks will sync when online'
      };
    }
  }

  /**
   * Generate personalized tasks based on comprehensive cognitive profile
   */
  private async generatePersonalizedTasks(nprProfile: NPRUserProfile): Promise<NPRTask[]> {
    const tasks: NPRTask[] = [];
    const profile = nprProfile.profile;
    
    if (!profile) return tasks;

    // Create a placeholder task signature - will be replaced by proper signing later
    const placeholderSignature: CryptographicSignature = {
      algorithm: 'sha256',
      hash: 'placeholder',
      salt: 'placeholder',
      timestamp: new Date()
    };

    // Cognitive-based task generation
    if (profile.cognitive_assessment && profile.cognitive_assessment.working_memory.score < 60) {
      tasks.push({
        id: `task-wm-${Date.now()}`,
        title: 'Working Memory Enhancement',
        description: 'Practice dual n-back exercises to improve working memory capacity',
        is_completed: false,
        is_ai_generated: true,
        priority: 'high',
        created_at: new Date(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        tags: ['cognitive', 'working-memory', 'enhancement'],
        cognitive_demand: {
          working_memory: 4,
          attention: 3,
          processing_speed: 2,
          executive_function: 3
        },
        personality_alignment: {
          matches_user_style: profile.personality_profile?.big_five?.conscientiousness > 60,
          adaptation_notes: 'Adjusted for high conscientiousness - structured approach',
          difficulty_adjustment: profile.personality_profile?.big_five?.conscientiousness > 80 ? 1 : 0
        },
        completion_context: {
          time_of_day: profile.behavioral_patterns?.engagement_level > 70 ? 'morning' : 'afternoon'
        },
        task_signature: placeholderSignature
      });
    }

    // Personality-based task generation
    if (profile.personality_profile && profile.personality_profile.big_five.openness > 70) {
      tasks.push({
        id: `task-creative-${Date.now()}`,
        title: 'Creative Exploration',
        description: 'Explore a new creative domain aligned with your high openness to experience',
        is_completed: false,
        is_ai_generated: true,
        priority: 'medium',
        created_at: new Date(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        tags: ['creativity', 'exploration', 'personality'],
        cognitive_demand: {
          working_memory: 2,
          attention: 3,
          processing_speed: 2,
          executive_function: 4
        },
        personality_alignment: {
          matches_user_style: true,
          adaptation_notes: 'High openness - creative and novel approach',
          difficulty_adjustment: 0
        },
        completion_context: {},
        task_signature: placeholderSignature
      });
    }

    // EI-based task generation
    if (profile.emotional_intelligence && profile.emotional_intelligence.social_awareness.empathy < 60) {
      tasks.push({
        id: `task-empathy-${Date.now()}`,
        title: 'Empathy Development',
        description: 'Practice perspective-taking exercises to enhance empathy skills',
        is_completed: false,
        is_ai_generated: true,
        priority: 'medium',
        created_at: new Date(),
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        tags: ['emotional-intelligence', 'empathy', 'social'],
        cognitive_demand: {
          working_memory: 2,
          attention: 4,
          processing_speed: 1,
          executive_function: 3
        },
        personality_alignment: {
          matches_user_style: profile.personality_profile?.big_five?.agreeableness > 50,
          adaptation_notes: 'Social skill development focus',
          difficulty_adjustment: 0
        },
        completion_context: {},
        task_signature: placeholderSignature
      });
    }

    return tasks;
  }

  /**
   * Infer communication preference from cognitive and personality data
   */
  private inferCommunicationPreference(personality: PersonalityProfile, cognitive: CognitiveAssessment): 'direct' | 'analogical' {
    if (!personality?.cognitive_style || !cognitive?.verbal_ability) {
      return 'direct'; // Default fallback
    }

    const analyticalScore = personality.cognitive_style.analytical_vs_intuitive;
    const verbalScore = cognitive.verbal_ability.vocabulary_score;
    const opennessScore = personality.big_five?.openness || 50;
    
    // Direct preference for high analytical, high verbal, lower openness
    // Analogical preference for high openness, more intuitive thinking
    const directScore = (analyticalScore + verbalScore) / 2 - (opennessScore * 0.3);
    
    return directScore > 60 ? 'direct' : 'analogical';
  }

  /**
   * Infer learning modalities from profile
   */
  private inferLearningModalities(personality: PersonalityProfile, cognitive: CognitiveAssessment): string[] {
    const modalities: string[] = [];
    
    if (cognitive?.spatial_ability?.spatial_visualization > 70) {
      modalities.push('visual');
    }
    
    if (cognitive?.verbal_ability?.vocabulary_score > 70) {
      modalities.push('reading-writing');
    }
    
    if (personality?.big_five?.extraversion > 70) {
      modalities.push('auditory', 'social');
    }
    
    if (personality?.learning_preferences?.kinesthetic > 60) {
      modalities.push('kinesthetic');
    }
    
    return modalities.length > 0 ? modalities : ['multimodal'];
  }

  /**
   * Infer interaction style from personality and EI
   */
  private inferInteractionStyle(
    personality: PersonalityProfile, 
    ei: EmotionalIntelligence
  ): 'explorative' | 'goal_directed' | 'social' | 'analytical' {
    if (!personality?.big_five || !personality?.cognitive_style) {
      return 'goal_directed'; // Default fallback
    }

    const openness = personality.big_five.openness;
    const conscientiousness = personality.big_five.conscientiousness;
    const extraversion = personality.big_five.extraversion;
    const analyticalStyle = personality.cognitive_style.analytical_vs_intuitive;
    
    if (openness > 70 && analyticalStyle < 50) return 'explorative';
    if (conscientiousness > 80) return 'goal_directed';
    if (extraversion > 70 && ei?.social_awareness?.empathy > 60) return 'social';
    if (analyticalStyle > 70) return 'analytical';
    
    return 'goal_directed'; // Default
  }

  /**
   * Calculate engagement level from personality traits
   */
  private calculateEngagementLevel(personality: PersonalityProfile): number {
    if (!personality?.big_five) {
      return 50; // Default fallback
    }

    return Math.round(
      (personality.big_five.openness * 0.3 +
       personality.big_five.conscientiousness * 0.3 +
       personality.big_five.extraversion * 0.2 +
       (100 - personality.big_five.neuroticism) * 0.2)
    );
  }

  /**
   * Infer help-seeking behavior
   */
  private inferHelpSeekingBehavior(
    personality: PersonalityProfile, 
    ei: EmotionalIntelligence
  ): 'independent' | 'collaborative' | 'guided' {
    if (!personality?.big_five || !ei?.self_awareness) {
      return 'guided'; // Default fallback
    }

    const conscientiousness = personality.big_five.conscientiousness;
    const extraversion = personality.big_five.extraversion;
    const selfConfidence = ei.self_awareness.self_confidence;
    
    if (selfConfidence > 80 && conscientiousness > 70) return 'independent';
    if (extraversion > 70 && ei.relationship_management?.team_leadership > 60) return 'collaborative';
    
    return 'guided';
  }

  // Legacy methods for backward compatibility with enhanced error handling
  async generateCommunicationPreference(entries: NPREntry[]): Promise<'direct' | 'analogical'> {
    try {
      if (!Array.isArray(entries) || entries.length === 0) {
        return 'direct'; // Default fallback
      }

      // Simple heuristic based on user responses
      const responses = entries.map(e => e.content?.toLowerCase() || '');
      const directKeywords = ['direct', 'straight', 'quick', 'brief', 'simple'];
      const analogicalKeywords = ['example', 'like', 'similar', 'compare', 'story'];
      
      const directScore = responses.reduce((score, response) => {
        return score + directKeywords.reduce((keywordScore, keyword) => {
          return keywordScore + (response.includes(keyword) ? 1 : 0);
        }, 0);
      }, 0);
      
      const analogicalScore = responses.reduce((score, response) => {
        return score + analogicalKeywords.reduce((keywordScore, keyword) => {
          return keywordScore + (response.includes(keyword) ? 1 : 0);
        }, 0);
      }, 0);
      
      return analogicalScore > directScore ? 'analogical' : 'direct';
    } catch (error) {
      console.error('Communication preference generation error:', error);
      return 'direct'; // Default fallback
    }
  }

  async generateTasks(userId: string, nprProfile: NPRUserProfile): Promise<NPRTaskResult> {
    try {
      const result = await this.makeServerRequest('/npr/generate-tasks', {
        userId,
        profile: nprProfile
      });

      return {
        success: true,
        tasks: result.tasks || []
      };
    } catch (error) {
      console.error('Generate tasks error:', error);
      
      // Return locally generated tasks as fallback
      const fallbackTasks = await this.generatePersonalizedTasks(nprProfile);
      
      return {
        success: true,
        tasks: fallbackTasks,
        offline: true
      };
    }
  }

  async getTasks(userId: string): Promise<NPRTaskResult> {
    try {
      const result = await this.makeServerRequest('/npr/get-tasks', { userId });
      
      return {
        success: true,
        tasks: result.tasks || []
      };
    } catch (error) {
      console.error('Get tasks error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tasks',
        tasks: []
      };
    }
  }

  async updateTask(userId: string, taskId: string, updates: Partial<NPRTask>): Promise<NPRResponseResult> {
    try {
      const result = await this.makeServerRequest('/npr/update-task', {
        userId,
        taskId,
        updates
      });

      return {
        success: true,
        task: result.task
      };
    } catch (error) {
      console.error('Update task error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task'
      };
    }
  }

  async generateFirstTask(): Promise<NPRTaskResult> {
    try {
      if (!this.userId) {
        throw new Error('User ID not set');
      }

      // Generate a simple first task
      const firstTask: NPRTask = {
        id: `task-${Date.now()}`,
        title: 'Welcome to akilii™',
        description: 'Take a moment to explore your personalized dashboard and discover how NPR can enhance your cognitive journey.',
        is_completed: false,
        is_ai_generated: true,
        priority: 'medium',
        created_at: new Date(),
        due_date: null,
        tags: ['welcome', 'onboarding'],
        cognitive_demand: {
          working_memory: 1,
          attention: 2,
          processing_speed: 1,
          executive_function: 2
        },
        personality_alignment: {
          matches_user_style: true,
          adaptation_notes: 'Welcome task - low cognitive demand',
          difficulty_adjustment: 0
        },
        completion_context: {},
        task_signature: await nprCryptoService.signData({})
      };

      const result = await this.makeServerRequest('/npr/save-task', {
        userId: this.userId,
        task: firstTask
      });

      return {
        success: true,
        task: result.task || firstTask,
        tasks: [result.task || firstTask]
      };
    } catch (error) {
      console.error('Generate first task error:', error);
      
      // Return a basic task even if save fails
      const basicTask: NPRTask = {
        id: `task-${Date.now()}`,
        title: 'Welcome to akilii™',
        description: 'Explore your personalized dashboard.',
        is_completed: false,
        is_ai_generated: true,
        priority: 'medium',
        created_at: new Date(),
        due_date: null,
        tags: ['welcome'],
        cognitive_demand: { working_memory: 1, attention: 1, processing_speed: 1, executive_function: 1 },
        personality_alignment: { matches_user_style: true, adaptation_notes: '', difficulty_adjustment: 0 },
        completion_context: {},
        task_signature: { algorithm: 'sha256', hash: '', salt: '', timestamp: new Date() }
      };

      return {
        success: true,
        task: basicTask,
        tasks: [basicTask],
        offline: true
      };
    }
  }

  async generateAIResponse(prompt: string): Promise<NPRResponseResult> {
    try {
      if (!this.userId) {
        throw new Error('User ID not set');
      }

      const result = await this.makeServerRequest('/npr/generate-ai-response', {
        userId: this.userId,
        prompt
      });

      return {
        success: true,
        content: result.response || result.content || 'I apologize, but I couldn\'t generate a response at this time. Please try again.',
        response: result.response
      };
    } catch (error) {
      console.error('Generate AI response error:', error);
      
      // Provide a helpful fallback response instead of throwing
      const fallbackResponse = this.generateFallbackResponse(prompt);
      
      return {
        success: true,
        content: fallbackResponse,
        response: fallbackResponse,
        offline: true
      };
    }
  }

  private generateFallbackResponse(prompt: string): string {
    // Simple pattern-based responses as fallback
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('goal') || promptLower.includes('objective')) {
      return "I'd be happy to help you with your goals! Setting clear, achievable objectives is a key part of personal growth. What specific goal would you like to work on?";
    }
    
    if (promptLower.includes('task') || promptLower.includes('todo')) {
      return "Task management is essential for productivity! I can help you break down complex objectives into manageable steps. What would you like to accomplish?";
    }
    
    if (promptLower.includes('challenge') || promptLower.includes('difficult')) {
      return "Challenges are opportunities for growth! Every obstacle teaches us something valuable. What challenge are you facing, and how can we approach it together?";
    }
    
    if (promptLower.includes('strength') || promptLower.includes('skill')) {
      return "Your strengths are powerful tools for achieving your goals! Identifying and leveraging what you do well is key to success. What strengths would you like to develop further?";
    }
    
    if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('hey')) {
      return "Hello! I'm here to support your cognitive journey with personalized guidance. How can I assist you today?";
    }
    
    if (promptLower.includes('help') || promptLower.includes('support')) {
      return "I'm here to help! As your NPR-enhanced AI companion, I can assist with goal setting, task planning, and providing personalized guidance. What would you like to explore?";
    }
    
    // Default response
    return "Thank you for sharing that with me. I'm here to provide personalized support based on your unique cognitive profile. Could you tell me more about what you'd like to work on or explore?";
  }

  async saveMoodEntry(userId: string, mood: string, notes?: string): Promise<NPRResponseResult> {
    try {
      const moodEntry: NPREntry = {
        id: `mood-${Date.now()}`,
        type: 'reflection',
        content: mood,
        timestamp: new Date(),
        metadata: {
          notes: notes || '',
          scale: this.moodToScale(mood),
          source: 'user_input'
        },
        signature: await nprCryptoService.signData({
          type: 'reflection',
          content: mood,
          timestamp: new Date()
        })
      };

      return await this.saveNPREntry(userId, 'reflection', mood, moodEntry.metadata);
    } catch (error) {
      console.error('Save mood entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save mood entry'
      };
    }
  }

  private moodToScale(mood: string): number {
    const moodMap: { [key: string]: number } = {
      'terrible': 1,
      'bad': 2,
      'poor': 3,
      'okay': 4,
      'good': 5,
      'great': 6,
      'excellent': 7,
      'amazing': 8,
      'fantastic': 9,
      'euphoric': 10
    };
    
    return moodMap[mood.toLowerCase()] || 5;
  }

  async generatePersonalizedInsight(userId: string, nprProfile: NPRUserProfile): Promise<NPRResponseResult> {
    try {
      // Ensure proper structure
      const structuredProfile = this.ensureProfileStructure(nprProfile);
      
      const goal = structuredProfile.entries.goal?.content;
      const challenge = structuredProfile.entries.challenge?.content;
      const strength = structuredProfile.entries.strength?.content;
      const commStyle = structuredProfile.profile?.comm_preference;

      let insight = "Based on your cognitive profile, here's a personalized insight: ";

      if (goal && strength) {
        insight += `Your strength in ${strength.toLowerCase()} is a powerful asset for achieving ${goal.toLowerCase()}. `;
      }

      if (challenge) {
        insight += `While ${challenge.toLowerCase()} may present obstacles, `;
        if (commStyle === 'analogical') {
          insight += `think of it like learning to ride a bike - each attempt builds the muscle memory needed for success. `;
        } else {
          insight += `breaking it into smaller, manageable steps will help you overcome it. `;
        }
      }

      if (commStyle === 'analogical') {
        insight += "Remember, growth is like tending a garden - consistent care and patience yield the best results.";
      } else {
        insight += "Focus on consistent daily actions that align with your goals for optimal results.";
      }

      return {
        success: true,
        content: insight,
        response: insight
      };
    } catch (error) {
      console.error('Generate personalized insight error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate insight'
      };
    }
  }
  
  // Remove the signup method since auth is handled directly by AuthScreen
}

export const nprService = new NPRService();