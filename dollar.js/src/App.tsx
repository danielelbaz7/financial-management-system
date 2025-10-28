import './App.css'
import HomeScreen from "./HomeScreen.tsx";
import { supabase }                   from './SupabaseClient'
import type { Session }               from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import Dashboard from "./Dashboard.tsx";

function App() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])


  return (
    session ? <Dashboard /> : <HomeScreen />
  )
}

export default App