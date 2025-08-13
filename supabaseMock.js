// Mock Supabase credentials
const SUPABASE_URL = 'https://mock.supabase.co';
const SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock Supabase client (if needed)
const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    signIn: () => Promise.resolve({ user: { id: 'mock-user' }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
};

module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY, supabase };