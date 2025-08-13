import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS and logging
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Singleton Supabase client for server
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  console.log('🔐 Server Supabase client created (singleton)');
  return supabaseInstance;
}

const supabase = getSupabaseClient();

// Health check endpoint
app.get('/make-server-feeffd69/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// NPR Profile endpoints
app.post('/make-server-feeffd69/npr/save-entry', async (c) => {
  try {
    // Check for authorization
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Invalid authorization header' }, 401);
    }

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { userId, entry } = await c.req.json();
    
    if (!userId || !entry) {
      return c.json({ error: 'Missing userId or entry' }, 400);
    }

    // Ensure the user can only access their own data
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to user data' }, 403);
    }

    // Save entry to KV store
    const key = `npr:${userId}:entry:${entry.id}`;
    await kv.set(key, entry);

    // Update user profile entries list
    const profileKey = `npr:${userId}:profile`;
    let profile = await kv.get(profileKey) || { entries: {}, allEntries: [] };
    
    // Add to type-specific entry
    profile.entries[entry.type] = entry;
    
    // Add to all entries list
    if (!profile.allEntries) profile.allEntries = [];
    profile.allEntries.push(entry);

    await kv.set(profileKey, profile);

    console.log(`NPR entry saved for user ${userId}: ${entry.type}`);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error('Save NPR entry error:', error);
    return c.json({ error: 'Failed to save entry' }, 500);
  }
});

app.post('/make-server-feeffd69/npr/get-profile', async (c) => {
  try {
    // Check for authorization
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Invalid authorization header' }, 401);
    }

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }

    // Ensure the user can only access their own data
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to user data' }, 403);
    }

    const profileKey = `npr:${userId}:profile`;
    const profile = await kv.get(profileKey);

    if (!profile) {
      return c.json({ 
        success: true, 
        profile: { 
          entries: {}, 
          allEntries: [],
          profile: null 
        } 
      });
    }

    console.log(`NPR profile retrieved for user ${userId}`);
    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Get NPR profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// AI Response Generation endpoint
app.post('/make-server-feeffd69/npr/generate-ai-response', async (c) => {
  try {
    const { userId, prompt } = await c.req.json();
    
    if (!userId || !prompt) {
      return c.json({ error: 'Missing userId or prompt' }, 400);
    }

    // Get user's NPR profile for context
    const profileKey = `npr:${userId}:profile`;
    const profile = await kv.get(profileKey);

    // Generate contextual response using OpenAI
    const openaiResponse = await generateOpenAIResponse(prompt, profile);

    // Log the interaction
    const interactionKey = `npr:${userId}:interaction:${Date.now()}`;
    await kv.set(interactionKey, {
      prompt,
      response: openaiResponse,
      timestamp: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      response: openaiResponse,
      content: openaiResponse 
    });
  } catch (error) {
    console.error('Generate AI response error:', error);
    return c.json({ error: 'Failed to generate AI response' }, 500);
  }
});

// OpenAI Response Generation Function
async function generateOpenAIResponse(prompt: string, profile: any): Promise<string> {
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, using fallback response');
      return generateFallbackResponse(prompt, profile);
    }

    // Build context from NPR profile
    let systemPrompt = `You are akilii™, an NPR-enhanced AI companion designed to provide personalized, cognitively-adaptive responses. You help users achieve their goals through thoughtful guidance.

Brand Identity:
- You represent akilii™ with the slogan "AI for every unique mind"
- You provide personalized support based on Neuropsychography (NPR) principles
- You adapt your communication style to each user's cognitive preferences

`;

    if (profile && profile.entries) {
      if (profile.entries.goal) {
        systemPrompt += `User's Primary Goal: ${profile.entries.goal.content}\n`;
      }
      if (profile.entries.challenge) {
        systemPrompt += `User's Current Challenge: ${profile.entries.challenge.content}\n`;
      }
      if (profile.entries.strength) {
        systemPrompt += `User's Key Strength: ${profile.entries.strength.content}\n`;
      }
      if (profile.profile?.comm_preference) {
        const commStyle = profile.profile.comm_preference;
        systemPrompt += `Communication Style: ${commStyle === 'direct' ? 'Direct and straightforward' : 'Analogical with examples and metaphors'}\n`;
      }
    }

    systemPrompt += `
Respond in a helpful, supportive manner that acknowledges the user's unique cognitive profile. Keep responses conversational, insightful, and actionable.`;

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return generateFallbackResponse(prompt, profile);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      console.error('Unexpected OpenAI response format:', data);
      return generateFallbackResponse(prompt, profile);
    }

  } catch (error) {
    console.error('OpenAI request failed:', error);
    return generateFallbackResponse(prompt, profile);
  }
}

// Fallback response generator
function generateFallbackResponse(prompt: string, profile: any): string {
  const promptLower = prompt.toLowerCase();
  const userName = profile?.entries?.name?.content || 'there';
  const goal = profile?.entries?.goal?.content;
  const commStyle = profile?.profile?.comm_preference;

  // Personalized responses based on user context
  if (promptLower.includes('goal') || promptLower.includes('objective')) {
    let response = `I'd be happy to help you with your goals, ${userName}! `;
    if (goal) {
      response += `I see you're working on ${goal.toLowerCase()}. `;
    }
    response += "Setting clear, achievable objectives is key to personal growth. What specific aspect would you like to explore?";
    return response;
  }

  if (promptLower.includes('challenge') || promptLower.includes('difficult')) {
    let response = "Challenges are opportunities for growth! ";
    if (commStyle === 'analogical') {
      response += "Think of it like climbing a mountain - each step, even the difficult ones, brings you closer to the summit. ";
    } else {
      response += "Breaking challenges into smaller, manageable steps makes them less overwhelming. ";
    }
    response += "What specific challenge are you facing?";
    return response;
  }

  if (promptLower.includes('strength') || promptLower.includes('skill')) {
    return "Your strengths are powerful tools for achieving your goals! Identifying and leveraging what you do well is essential for success. What strengths would you like to develop further?";
  }

  if (promptLower.includes('task') || promptLower.includes('todo')) {
    return "Task management is crucial for productivity! I can help you organize your objectives into actionable steps. What would you like to accomplish?";
  }

  if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('hey')) {
    let response = `Hello, ${userName}! `;
    if (goal) {
      response += `I'm here to support you with ${goal.toLowerCase()} and `;
    } else {
      response += "I'm here to support ";
    }
    response += "your cognitive journey. How can I assist you today?";
    return response;
  }

  // Default personalized response
  let response = `Thank you for sharing that with me, ${userName}. `;
  if (commStyle === 'analogical') {
    response += "Like a skilled navigator, I'm here to help you chart the best course for your unique journey. ";
  } else {
    response += "I'm here to provide direct, personalized guidance based on your cognitive profile. ";
  }
  response += "What would you like to explore or work on?";
  
  return response;
}

// Task endpoints
app.post('/make-server-feeffd69/npr/generate-tasks', async (c) => {
  try {
    const { userId, profile } = await c.req.json();
    
    if (!userId || !profile) {
      return c.json({ error: 'Missing userId or profile' }, 400);
    }

    // Generate AI-powered tasks based on profile
    const tasks = await generatePersonalizedTasks(profile);

    // Save tasks to KV store
    const tasksKey = `npr:${userId}:tasks`;
    let existingTasks = await kv.get(tasksKey) || [];
    
    // Add new tasks
    const updatedTasks = [...existingTasks, ...tasks];
    await kv.set(tasksKey, updatedTasks);

    return c.json({ success: true, tasks });
  } catch (error) {
    console.error('Generate tasks error:', error);
    return c.json({ error: 'Failed to generate tasks' }, 500);
  }
});

app.post('/make-server-feeffd69/npr/get-tasks', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }

    const tasksKey = `npr:${userId}:tasks`;
    const tasks = await kv.get(tasksKey) || [];

    return c.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return c.json({ error: 'Failed to get tasks' }, 500);
  }
});

app.post('/make-server-feeffd69/npr/save-task', async (c) => {
  try {
    const { userId, task } = await c.req.json();
    
    if (!userId || !task) {
      return c.json({ error: 'Missing userId or task' }, 400);
    }

    const tasksKey = `npr:${userId}:tasks`;
    let tasks = await kv.get(tasksKey) || [];
    
    tasks.push(task);
    await kv.set(tasksKey, tasks);

    return c.json({ success: true, task });
  } catch (error) {
    console.error('Save task error:', error);
    return c.json({ error: 'Failed to save task' }, 500);
  }
});

app.post('/make-server-feeffd69/npr/update-task', async (c) => {
  try {
    const { userId, taskId, updates } = await c.req.json();
    
    if (!userId || !taskId || !updates) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    const tasksKey = `npr:${userId}:tasks`;
    let tasks = await kv.get(tasksKey) || [];
    
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    if (taskIndex === -1) {
      return c.json({ error: 'Task not found' }, 404);
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await kv.set(tasksKey, tasks);

    return c.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// Psychometric Assessment endpoint
app.post('/make-server-feeffd69/npr/save-psychometric-assessment', async (c) => {
  try {
    const { userId, profile } = await c.req.json();
    
    if (!userId || !profile) {
      return c.json({ error: 'Missing userId or profile' }, 400);
    }

    // Save comprehensive profile
    const profileKey = `npr:${userId}:profile`;
    let existingProfile = await kv.get(profileKey) || { entries: {}, allEntries: [] };
    
    // Update with psychometric data
    existingProfile.profile = profile;
    existingProfile.psychometric_battery = {
      completion_status: {
        cognitive_assessment: !!profile.cognitive_assessment,
        personality_profile: !!profile.personality_profile,
        emotional_intelligence: !!profile.emotional_intelligence,
        standardized_assessments: !!profile.standardized_assessments
      },
      last_assessment_date: new Date(),
      next_scheduled_assessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    await kv.set(profileKey, existingProfile);

    // Also save as separate psychometric data
    const psychometricKey = `npr:${userId}:psychometric`;
    await kv.set(psychometricKey, profile);

    console.log('Psychometric assessment saved successfully for user:', userId);

    return c.json({ success: true, profile: existingProfile });
  } catch (error) {
    console.error('Save psychometric assessment error:', error);
    return c.json({ error: 'Failed to save psychometric assessment' }, 500);
  }
});

// Enhanced tasks generation endpoint
app.post('/make-server-feeffd69/npr/generate-enhanced-tasks', async (c) => {
  try {
    const { userId, profile, tasks } = await c.req.json();
    
    if (!userId || !profile) {
      return c.json({ error: 'Missing userId or profile' }, 400);
    }

    // Save enhanced tasks to KV store
    const tasksKey = `npr:${userId}:tasks`;
    let existingTasks = await kv.get(tasksKey) || [];
    
    // Add new enhanced tasks
    const enhancedTasks = tasks || await generatePersonalizedTasks(profile);
    const updatedTasks = [...existingTasks, ...enhancedTasks];
    await kv.set(tasksKey, updatedTasks);

    console.log('Enhanced tasks generated for user:', userId, 'Count:', enhancedTasks.length);

    return c.json({ success: true, tasks: enhancedTasks });
  } catch (error) {
    console.error('Generate enhanced tasks error:', error);
    return c.json({ error: 'Failed to generate enhanced tasks' }, 500);
  }
});

// User signup endpoint
app.post('/make-server-feeffd69/auth/signup', async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    
    if (!email || !password || !fullName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create user with Supabase admin
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { full_name: fullName },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Signup request error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// File upload and processing endpoints
app.post('/make-server-feeffd69/files/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: 'File size exceeds 10MB limit' }, 400);
    }

    // Generate unique file ID
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${fileId}_${file.name}`;
    
    // Create bucket if it doesn't exist
    const bucketName = 'make-feeffd69-uploads';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Generate signed URL for private access
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return c.json({ error: 'Failed to generate file URL' }, 500);
    }

    // Process file based on type
    let analysis = null;
    let extractedText = null;

    if (file.type.startsWith('text/')) {
      try {
        extractedText = await file.text();
        analysis = `Text file with ${extractedText.length} characters`;
      } catch (error) {
        console.warn('Text extraction failed:', error);
      }
    } else if (file.type.startsWith('image/')) {
      analysis = await analyzeImage(file);
    } else if (file.type === 'application/pdf') {
      analysis = `PDF document (${Math.floor(file.size / 1024)}KB)`;
    }

    // Store file metadata
    await kv.set(`file:${fileId}`, {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: signedUrlData.signedUrl,
      storagePath: fileName,
      extractedText,
      analysis,
      uploadedAt: new Date().toISOString()
    });

    return c.json({
      fileId,
      url: signedUrlData.signedUrl,
      analysis,
      extractedText: extractedText?.substring(0, 500) // First 500 chars for preview
    });

  } catch (error) {
    console.error('File upload error:', error);
    return c.json({ error: 'File upload failed' }, 500);
  }
});

// Image analysis helper function
async function analyzeImage(imageFile: File): Promise<string> {
  try {
    // This would typically use a vision API like OpenAI Vision, Google Vision, etc.
    // For now, return basic file info
    const sizeInKB = Math.floor(imageFile.size / 1024);
    const type = imageFile.type.split('/')[1].toUpperCase();
    
    return `${type} image file (${sizeInKB}KB). This image can be analyzed for content, objects, text, and context when integrated with vision AI services.`;
  } catch (error) {
    console.error('Image analysis error:', error);
    return 'Image file uploaded successfully. Vision analysis requires additional AI services.';
  }
}

// Enhanced AI Response Generation with file context
app.post('/make-server-feeffd69/npr/generate-ai-response-with-files', async (c) => {
  try {
    const { userId, prompt, fileIds } = await c.req.json();
    
    if (!userId || !prompt) {
      return c.json({ error: 'Missing userId or prompt' }, 400);
    }

    // Get user's NPR profile for context
    const profileKey = `npr:${userId}:profile`;
    const profile = await kv.get(profileKey);

    // Get file context if files are provided
    let fileContext = '';
    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        const fileData = await kv.get(`file:${fileId}`);
        if (fileData) {
          fileContext += `\n\nFile: ${fileData.name} (${fileData.type})\n`;
          if (fileData.extractedText) {
            fileContext += `Content: ${fileData.extractedText}\n`;
          }
          if (fileData.analysis) {
            fileContext += `Analysis: ${fileData.analysis}\n`;
          }
        }
      }
    }

    // Enhanced context with file information
    const enhancedPrompt = prompt + fileContext;

    // Generate contextual response using OpenAI
    const openaiResponse = await generateOpenAIResponse(enhancedPrompt, profile);

    // Log the interaction with file context
    const interactionKey = `npr:${userId}:interaction:${Date.now()}`;
    await kv.set(interactionKey, {
      prompt: enhancedPrompt,
      response: openaiResponse,
      fileIds: fileIds || [],
      timestamp: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      response: openaiResponse,
      content: openaiResponse 
    });
  } catch (error) {
    console.error('Generate AI response with files error:', error);
    return c.json({ error: 'Failed to generate AI response' }, 500);
  }
});

// Text-to-speech endpoint
app.post('/make-server-feeffd69/tts/generate', async (c) => {
  try {
    const { text, voice = 'default' } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'No text provided' }, 400);
    }

    // This would typically integrate with a TTS service like OpenAI TTS, Google Cloud TTS, etc.
    // For now, return instructions for client-side synthesis
    return c.json({
      success: true,
      message: 'Use browser Speech Synthesis API for TTS',
      instructions: {
        text,
        voice,
        settings: {
          rate: 0.9,
          pitch: 1.0,
          volume: 0.8
        }
      }
    });
  } catch (error) {
    console.error('TTS generation error:', error);
    return c.json({ error: 'TTS generation failed' }, 500);
  }
});

// Enhanced follow-up prompts generation
app.post('/make-server-feeffd69/npr/generate-followups', async (c) => {
  try {
    const { userId, conversationContext, lastResponse } = await c.req.json();
    
    if (!userId || !lastResponse) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    // Get user profile for personalization
    const profileKey = `npr:${userId}:profile`;
    const profile = await kv.get(profileKey);

    // Generate contextual follow-up prompts
    const followUps = await generateFollowUpPrompts(lastResponse, profile, conversationContext);

    return c.json({
      success: true,
      followUps
    });
  } catch (error) {
    console.error('Generate follow-ups error:', error);
    return c.json({ error: 'Failed to generate follow-up prompts' }, 500);
  }
});

// Follow-up prompts generation helper
async function generateFollowUpPrompts(lastResponse: string, profile: any, context: any[]): Promise<any[]> {
  const prompts = [];
  const responseLower = lastResponse.toLowerCase();

  // Context-aware prompt generation
  if (responseLower.includes('goal') || responseLower.includes('objective')) {
    prompts.push({
      id: `followup-${Date.now()}-1`,
      text: 'How can I break this down into smaller steps?',
      category: 'action',
      icon: '📋'
    });
  }

  if (responseLower.includes('learn') || responseLower.includes('understand')) {
    prompts.push({
      id: `followup-${Date.now()}-2`,
      text: 'Can you give me practical examples?',
      category: 'deepdive',
      icon: '💡'
    });
  }

  if (responseLower.includes('problem') || responseLower.includes('challenge')) {
    prompts.push({
      id: `followup-${Date.now()}-3`,
      text: 'What are some alternative approaches?',
      category: 'related',
      icon: '🔄'
    });
  }

  // Add NPR-personalized prompts based on user profile
  if (profile?.profile?.comm_preference === 'analogical') {
    prompts.push({
      id: `followup-${Date.now()}-4`,
      text: 'Can you explain this with an analogy?',
      category: 'clarification',
      icon: '🎭'
    });
  }

  // Always include generic helpful prompts
  prompts.push({
    id: `followup-${Date.now()}-5`,
    text: 'Tell me more about this',
    category: 'deepdive',
    icon: '🔍'
  });

  prompts.push({
    id: `followup-${Date.now()}-6`,
    text: 'How does this relate to my goals?',
    category: 'related',
    icon: '🎯'
  });

  return prompts.slice(0, 6); // Return max 6 prompts
}

// Task generation helper
async function generatePersonalizedTasks(profile: any): Promise<any[]> {
  const goal = profile.entries?.goal?.content;
  const challenge = profile.entries?.challenge?.content;
  const strength = profile.entries?.strength?.content;
  
  const tasks = [];
  
  if (goal) {
    tasks.push({
      id: `task-goal-${Date.now()}`,
      title: `Work on: ${goal}`,
      description: `Take a focused step towards achieving ${goal.toLowerCase()}`,
      is_completed: false,
      is_ai_generated: true,
      priority: 'high',
      created_at: new Date(),
      due_date: null,
      tags: ['goal', 'ai-generated']
    });
  }

  if (challenge) {
    tasks.push({
      id: `task-challenge-${Date.now() + 1}`,
      title: `Address Challenge: ${challenge}`,
      description: `Break down ${challenge.toLowerCase()} into manageable steps`,
      is_completed: false,
      is_ai_generated: true,
      priority: 'medium',
      created_at: new Date(),
      due_date: null,
      tags: ['challenge', 'ai-generated']
    });
  }

  if (strength) {
    tasks.push({
      id: `task-strength-${Date.now() + 2}`,
      title: `Leverage Strength: ${strength}`,
      description: `Use your ${strength.toLowerCase()} to make progress on your goals`,
      is_completed: false,
      is_ai_generated: true,
      priority: 'medium',
      created_at: new Date(),
      due_date: null,
      tags: ['strength', 'ai-generated']
    });
  }

  return tasks;
}

// Catch-all error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
Deno.serve(app.fetch);