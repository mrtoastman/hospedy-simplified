import { createBrowserClient } from '@supabase/ssr';

let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

// Backward compat — lazy getter
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  }
});
