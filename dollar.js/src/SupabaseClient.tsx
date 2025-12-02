//this page is extremely simple and was taken from ChatGPT for speed of typing and for
//correct env access syntax and then modified for the correct
//env keys. that is why the comments are there. basically, it just pulls the url and supabase key and creates
//a shared supabase client with it

// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// These come from your .env
const URL = import.meta.env.VITE_SUPABASE_URL as string
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

//single, shared client, the client is held across sessions and able to be imported for supabase functions inside of the frontend
export const supabase = createClient(URL, KEY)
