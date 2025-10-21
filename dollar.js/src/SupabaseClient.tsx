// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// These come from your .env
const URL = import.meta.env.VITE_SUPABASE_URL as string
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Single, shared client
export const supabase = createClient(URL, KEY)
