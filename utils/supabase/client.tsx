import { createClient, SupabaseClient } from '@supabase/supabase-js@2';
import { projectId, publicAnonKey } from './info';

// Type for our Supabase client
type Database = any; // You can define your database types here

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the singleton Supabase client instance
 * This ensures only one GoTrueClient instance exists across the entire application
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only if none exists
  supabaseInstance = createClient<Database>(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'akilii-auth-token',
        storage: window?.localStorage,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );

  // Log client creation for debugging
  console.log('🔐 Supabase client created (singleton)');

  return supabaseInstance;
}

/**
 * Reset the Supabase client instance (useful for testing or cleanup)
 */
export function resetSupabaseClient(): void {
  if (supabaseInstance) {
    console.log('🔐 Resetting Supabase client instance');
    supabaseInstance = null;
  }
}

/**
 * Get current session from the singleton client
 */
export async function getCurrentSession() {
  const client = getSupabaseClient();
  try {
    const { data: { session }, error } = await client.auth.getSession();
    return { session, error };
  } catch (error) {
    console.error('Error getting current session:', error);
    return { session: null, error };
  }
}

/**
 * Sign out from the singleton client
 */
export async function signOut() {
  const client = getSupabaseClient();
  try {
    const { error } = await client.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

/**
 * Set session in the singleton client
 */
export async function setSession(accessToken: string, refreshToken: string) {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return { data, error };
  } catch (error) {
    console.error('Error setting session:', error);
    return { data: null, error };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange(callback);
}

// Export the client getter as default
export default getSupabaseClient;