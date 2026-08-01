import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const FALLBACK_SUPABASE_URL = "https://eqspbruarsdybpfeijnf.supabase.co";
const FALLBACK_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY3MDA0MzQsImV4cCI6MjAyMjI3NjQzNH0.dummy_fallback_key";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.trim()) || FALLBACK_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim()) || FALLBACK_SUPABASE_KEY;

let clientInstance: any;

try {
  clientInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
} catch (e) {
  console.warn("⚠️ [CRASH PREVENTED] Failed to initialize Supabase client, using safe fallback:", e);
  clientInstance = createClient<Database>(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_KEY);
}

export const supabase = clientInstance;