import "./index.css"
import "./category-menu.css"
import {useEffect, useState} from 'react'
import * as React from "react";
import {supabase} from "./SupabaseClient.tsx";
import type {Session} from "@supabase/supabase-js";

interface BackdropProps {
    onClose: () => void;
}

export default function CategoryMenu({ onClose }: BackdropProps) {
    const [category, setCategory] = useState(null);
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])

    const handleAddCategory = async (e: React.FormEvent)=> {
        e.preventDefault();

        if (category === null) {
            setError("Please enter category.");
            return;
        }

        if(session?.access_token === null) {
            setError("No access token.");
            return;
        }

        const response = await fetch("http://localhost:5000/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                user_id: session?.user?.id,
                name: category,
            }),
        });


        if(response.ok) {
            alert("Category added successfully.");
            onClose();
            return
        } else {
            alert("Error when adding category.");
            return
        }
    }

    return (
        <div className="c-menu">
            <div className="category-menu-header">
                <h3>Add New Category</h3>
                <button onClick={onClose} style={{cursor: "pointer"}}>
                    &times;
                </button>
            </div>
            <div>
                <label>Name of New Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} type="text" placeholder="Input Name Here" className="input-field mt-5 mb-5"/>
            </div>
            <button className="w-full flex justify-center cursor-pointer" onClick={handleAddCategory}>Confirm Add</button>
        </div>
    )
}