/**
 * Supabase Browser Client Configuration
 * 
 * Future usage: Install @supabase/ssr and @supabase/supabase-js 
 * and replace the mock with the actual createBrowserClient.
 */

// import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your_supabase")) {
    // console.warn('Supabase env vars missing. Running in Mock Mode.');
    return mockSupabaseClient();
  }

  // Real implementation:
  // return createBrowserClient(supabaseUrl, supabaseAnonKey)
  throw new Error("Supabase @supabase/ssr package needs to be installed.");
}

// Mock client that simulates successful auth and basic DB returns
const mockSupabaseClient = () => {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: "mock-user", email: "driller@rapdojo.com" } },
        error: null,
      }),
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: async () => ({ data: [], error: null }),
        single: async () => ({ data: { streak: 14 }, error: null }),
      }),
      insert: async () => ({ error: null }),
    }),
  };
};
