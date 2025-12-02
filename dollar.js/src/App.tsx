import './App.css'
import HomeScreen from "./HomeScreen.tsx";
import { supabase }                   from './SupabaseClient'
import type { Session }               from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import Dashboard from "./Dashboard.tsx";

function App() {
    //stores session
    const [session, setSession] = useState<Session | null>(null)

    //pulls session and stores it in localstorage to determine whether to display landing page or dashboard
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

    //adds a user to the "users" table in database upon registration
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


    //returns dashboard if user logged in and homescreen otherwise
  return (
    session ? <Dashboard /> : <HomeScreen />
  )
}

export default App