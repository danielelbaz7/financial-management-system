import { supabase }                   from './SupabaseClient'
import type { Session }               from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import Dashboard from "./Dashboard.tsx";
import LoginPage from "./LoginPage.tsx";

// manages login, so when you click to login this determines
// if you should go to the login page or if you are already signed in
// and should go to the dashboard
export default function LoginManager() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])

    return (
        session ? <Dashboard /> : <LoginPage />
    )
}