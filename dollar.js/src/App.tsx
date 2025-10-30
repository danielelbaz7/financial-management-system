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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setSession(newSession);
                if (newSession) {
                    await handleAddUser(newSession);
                    localStorage.setItem("showLoginLocalStorage", JSON.stringify(false))
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [])

    const handleAddUser = async (session: Session) => {
        try {
            await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
            });
        } catch (error) {
            console.error("Register call failed:", error);
        }
    };


  return (
    session ? <Dashboard /> : <HomeScreen />
  )
}

export default App