import "./index.css"
import "./dashboard.css"

import DashboardHeader from "./Dashboard-header.tsx"
import {useEffect, useState} from "react";
import * as React from "react";
import type {Session} from "@supabase/supabase-js";
import {supabase} from "./SupabaseClient.tsx";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface Transaction {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    description: string;
    date: string; // or Date if you convert
    type: "income" | "expense";
}


export default function Dashboard() {
    const [income, setIncome] = useState<number>(0);
    const [expenses, setExpenses] = useState<number>(0);

    const [session, setSession] = useState<Session | null>(null)

    const [transactions, setTransactions] = useState<Transaction[]>([]);

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

        const data = await response.json()

        let tempIncome = 0
        let tempExpense = 0

        const tempTransactions = []

        for(const res of data) {
            tempTransactions.push(res)
            if(res["type"] == 'income') {
                tempIncome += res["amount"]
            } else if (res["type"] == 'expense') {
                tempExpense += res["amount"]
            }
        }

        setIncome(tempIncome)
        setExpenses(tempExpense)
        setTransactions(tempTransactions)

    }

    const dataExpenses = {
        labels: ["Food", "Rent", "Shopping"],
        datasets: [
            {
                data: [200, 800, 150],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                ],
            },
        ],
    };

    const dataIncome = {
        labels: ["Occupation", "Side Hustle"],
        datasets: [
            {
                data: [200, 50],
                backgroundColor: [
                    "#79f279",
                    "#f0ac59"
                ],
            },
        ],
    };


    const optionsExpenses = {
        plugins: {
            title: {
                display: true,
                text: "Your Expense Breakdown",   // ← chart title
                font: {
                    size: 18
                }
            },
            legend: {
                display: true,
                position: "bottom"
            }
        }
    };

    const optionsIncome = {
        plugins: {
            title: {
                display: true,
                text: "Your Income Breakdown",   // ← chart title
                font: {
                    size: 18
                }
            },
            legend: {
                display: true,
                position: "bottom"
            }
        }
    };


    return(
        <div>
            <DashboardHeader  />
            <div id="budget" className="mt-4">
                <div className="card1 budget-card">
                    <p className="category-label">Total Budget</p>
                    <p className="amount">${income}</p>
                </div>
                <div className="card1 spent-card">
                    <p className="category-label">Total Spent</p>
                    <p className="amount">${expenses}</p>
                </div>
                <div className="card1 remaining-card">
                    <p className="category-label">Total Remaining</p>
                    <p className="amount">${income-expenses}</p>
                </div>
            </div>
            <button className="text-black font-bold border-gray-400 p-3 border-2 rounded-2xl cursor-pointer" onClick={obtainTransactions}>
                Update Transactions
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
            <div className="flex justify-center gap-48">
                <div className="mt-8">
                    <Pie data={dataIncome} options={optionsIncome}/>
                </div>
                <div className="mt-8">
                    <Pie data={dataExpenses} options={optionsExpenses}/>
                </div>
            </div>

            <div className="mx-auto mt-16 w-128">
                {transactions.map(transaction => (
                    <div className="text-black ">
                        <div className="gap-24 border-4 my-4 py-4 rounded-xl">
                            <div>
                            Category: {transaction.category_id}
                            </div>

                            <div>
                                Description: {transaction.description}
                            </div>

                            <div>
                                Amount: {transaction.amount}
                            </div>

                            <div>
                                Type: {transaction.type}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}