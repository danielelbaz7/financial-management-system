import "./index.css"
import "./dashboard-menu.css"
import { useEffect, useState } from 'react';
import * as React from "react";
import type {Session} from "@supabase/supabase-js";
import {supabase} from "./SupabaseClient.tsx";
import { type ChangeEvent } from 'react';

interface BackdropProps {
    onClose: () => void;
}

export default function TransactionMenu({ onClose }: BackdropProps) {
    const [incomeOrExpense, setIncomeOrExpense] = React.useState("income");
    const [amount, setAmount] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [description, setDescription] = useState("");

    const [category, setCategory] = useState("Choose a Category");
    const options = [{label: "Rent", value: "rent"}, {label: "Food", value: "food"}, {label: "Transportation", value: "transportation"}, {label: "Occupation", value: "occupation"}];

    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])

    const handleAddTransaction = async (e: React.FormEvent)=> {
        e.preventDefault();

        if (amount === null) {
            setError("Please enter amount.");
            return;
        }

        if(session?.access_token === null) {
            setError("No access token.");
            return;
        }

        const response = await fetch("http://localhost:5000/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                category_id: category,
                amount: amount,
                description: description,
                date: new Date().toISOString().split("T")[0],
                type: incomeOrExpense,
            }),
        });


        if(response.ok) {
            alert("Transaction added successfully.");
            onClose();
            return
        } else {
            alert("Error when adding transaction.");
            return
        }
    }

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setCategory(event.target.value);
    }

    return (
        <div className="transaction-menu" style={{
            height: error ? "475px" : "435px",
        }}>
            <div className="transaction-header">
                <h3>Add Transaction</h3>
                <button className="close-menu" onClick={onClose}>
                    &times;
                </button>
            </div>
            <form className="transaction-form">
                <div className="form-group">
                    <label>Type</label>
                    <div className="radio-group">
                        <label>
                            <input type="radio" value="income" name="incomeOrExpense" checked={incomeOrExpense === "income"} onChange={(e) => setIncomeOrExpense(e.target.value)}/>
                            Income
                        </label>
                        <label>
                            <input type="radio" value="expense" name="incomeOrExpense" checked={incomeOrExpense === "expense"} onChange={(e) => setIncomeOrExpense(e.target.value)}/>
                            Expense
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Amount ($)</label>
                    <input type="number" placeholder="0.00" value={amount === null ? "" : amount} onChange={(e) => setAmount(e.target.value === "" ? null : Number(e.target.value))} className="input-field"/>
                </div>
                <div className="form-group">


                    <label>Category</label>


                    <select value={category} onChange={handleChange} style={{border: "1px solid black"}}>


                        {options.map((option) => (


                            <option key={option.value} value={option.value}>


                                {option.label}


                            </option>


                        ))}


                    </select>


                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="What was this for?" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field"/>
                </div>

                {error && (
                    <div
                        className={`text-center rounded-lg mx-6 ${
                            error.includes("Check your email")
                                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}
                        style={{ fontSize: "14px", padding: "12px" }}
                    >
                        {error}
                    </div>
                )}
                
                <button className="add-transaction-button" onClick={handleAddTransaction}>
                    Add Transaction
                </button>
            </form>
        </div>
    )
}