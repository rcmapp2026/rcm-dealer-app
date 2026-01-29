
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dkgveikqqzzofiizelrt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ3ZlaWtxcXp6b2ZpaXplbHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODgwNTcsImV4cCI6MjA4MTk2NDA1N30.HMb8cekSdiSjeidzXZivsRkRvWXXq4_-myBlX6pLw6U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'rcm-auth-session-v3'
  },
  global: {
    headers: { 'x-application-name': 'rcm-pro-stable' }
  }
});

// STABILITY WATCHDOG: Keeps session alive every 45 seconds
if (typeof window !== 'undefined') {
  setInterval(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.expires_at) {
        const remaining = session.expires_at - Math.floor(Date.now() / 1000);
        if (remaining < 600) { // Less than 10 mins left
          await supabase.auth.refreshSession();
        }
      }
    } catch (e) {
      console.warn("Session watchdog skipped (Network Offline)");
    }
  }, 45000);
}
