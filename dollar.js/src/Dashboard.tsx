import "./index.css"
import "./dashboard.css"

import DashboardHeader from "./Dashboard-header.tsx"
import {useEffect, useState} from "react";
import * as React from "react";
import type {Session} from "@supabase/supabase-js";
import {supabase} from "./SupabaseClient.tsx";
export default function Dashboard() {
    const [income, setIncome] = useState<number>(0);
    const [expenses, setExpenses] = useState<number>(0);

    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])


    const obtainTransactions = async () => {
        const response = await fetch("http://localhost:5000/transactions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`,
            }
        })

        let income = 0
        let costs = 0

        const data = await response.json()

        for(const res of data) {
            if(res["type"] == 'income') {
                income += res["amount"]
            } else if (res["type"] == 'expense') {
                costs += res["amount"]
            }
        }

    }


    return(
        <div>
            <DashboardHeader  />
            <div id="budget" className="mt-4">
                <div className="card1 budget-card">
                    <p className="category-label">Total Budget</p>
                    <p className="amount">$0.00</p>
                </div>
                <div className="card1 spent-card">
                    <p className="category-label">Total Spent</p>
                    <p className="amount">$0.00</p>
                </div>
                <div className="card1 remaining-card">
                    <p className="category-label">Total Remaining</p>
                    <p className="amount">$0.00</p>
                </div>
            </div>
            <button className="bg-black" onClick={obtainTransactions}>
                HELLO
            </button>
            <div className="header">Top Spending Categories</div>
            <div id="categories">
                <div className="category-card">
                    <div className="category-label">Rent</div>
                    <div>$0.00</div>
                </div>
                <div className="category-card">
                    <div className="category-label">Food</div>
                    <div>$0.00</div>
                </div>
                <div className="category-card">
                    <div className="category-label">Entertainment</div>
                    <div>$0.00</div>
                </div>
            </div>
            <div className="header">Top Income Categories</div>
            <div id="categories">
                <div className="category-card">
                    <div className="category-label">Occupation</div>
                    <div>$0.00</div>
                </div>
            </div>
            <div className="spending">
                <h2>Spending Overview</h2>
            </div>
        </div>
    )
}