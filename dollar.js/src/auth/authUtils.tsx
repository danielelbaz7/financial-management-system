// Example: Get the Supabase session/token
import { supabase } from '../SupabaseClient.tsx'; // Your initialized Supabase client

export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}