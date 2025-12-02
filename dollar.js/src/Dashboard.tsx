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
    category_name: string;
    amount: number;
    description: string;
    date: string; // or Date if you convert
    type: "income" | "expense";
}


export default function Dashboard() {
    const [income, setIncome] = useState<number>(0);
    const [expenses, setExpenses] = useState<number>(0);
    const [admin, setAdmin] = useState<boolean>(false);

    const [session, setSession] = useState<Session | null>(null)

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [incomeDict, setIncomeDict] = useState<Record<string, number>>({});
    const [expenseDict, setExpenseDict] = useState<Record<string, number>>({});
    const [ascending, setAscending] = useState<boolean>(true);

    // usestate variables for the ai feedback
    const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);


    // this function is used to call the AI analysis from the backend
    const fetchAnalysis = async () => {
        try {
            setAnalysisLoading(true);
            setAnalysisError(null);


            const res = await fetch("http://localhost:5000/finance-advice", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`,
                },
            });
            const data = await res.json();
            setAnalysisResponse(data.ai.summary);

        } catch (err: any) {
            setAnalysisError(err.message ?? "Failed to fetch feedback.");
        } finally {
            setAnalysisLoading(false);
        }
    };


    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])

    const obtainAdmin = async () => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("admin")
                .eq("id", session?.user?.id)
                .single()
            console.log(data)
            if(error) throw error;
            setAdmin(data.admin)
        } catch (error) {
            console.log(error)
            setAdmin(false)
            }
    }

    useEffect(() => {
        obtainTransactions()
        obtainAdmin()
    }, [session]);

    const sortReversed = () => {
        const tempAscending = !ascending
        setAscending(tempAscending)
        sortTransactions(tempAscending)
        return
    }


    const sortTransactions = (tempAscending : boolean) => {
        const sorted = [...transactions].sort((a,b) =>
            tempAscending? a.amount - b.amount : b.amount - a.amount)

        setTransactions(sorted)
        return

    }

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

        let tempIncomeDict: Record<string, number> = {};
        let tempExpenseDict: Record<string, number> = {};


        const tempTransactions = []

        for(const res of data) {
            tempTransactions.push(res)
            if(res["type"] == 'income') {
                if(res["category_name"] in tempIncomeDict) {
                    tempIncomeDict[res["category_name"]] += res["amount"]
                } else {
                    tempIncomeDict[res["category_name"]] = res["amount"]
                }
                tempIncome += res["amount"]
            } else if (res["type"] == 'expense') {
                if(res["category_name"] in tempExpenseDict) {
                    tempExpenseDict[res["category_name"]] += res["amount"]
                } else {
                    tempExpenseDict[res["category_name"]] = res["amount"]
                }
                tempExpense += res["amount"]
            }
        }

        setIncomeDict(tempIncomeDict)
        setExpenseDict(tempExpenseDict)

        setIncome(tempIncome)
        setExpenses(tempExpense)

        const sorted = [...tempTransactions].sort((a, b) =>
            ascending ? a.amount - b.amount : b.amount - a.amount
        )

        setTransactions(sorted)



    }

    const dataExpenses = {
        labels: Object.keys(expenseDict),
        datasets: [
            {
                data: Object.values(expenseDict),
                backgroundColor: [
                    "#A855F7",
                    "#6366F1",
                    "#EC4899",
                    "#22C55E",
                    "#F97316",
                    "#06B6D4",
                    "#EAB308",
                    "#3B82F6",
                    "#F43F5E",
                    "#14B8A6",
                ],
            },
        ],
    };

    const dataIncome = {
        labels: Object.keys(incomeDict),
        datasets: [
            {
                data: Object.values(incomeDict),
                backgroundColor: [
                    "#14B8A6",
                    "#F43F5E",
                    "#3B82F6",
                    "#EAB308",
                    "#06B6D4",
                    "#F97316",
                    "#22C55E",
                    "#EC4899",
                    "#6366F1",
                    "#A855F7",
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
            <DashboardHeader obtainTransactions={obtainTransactions} admin={admin}/>
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
            <div className="flex justify-center gap-48">
                <div className="mt-8">
                    <Pie data={dataIncome} options={optionsIncome}/>
                </div>
                <div className="mt-8">
                    <Pie data={dataExpenses} options={optionsExpenses}/>
                </div>
            </div>


            <div className="flex gap-8 mt-8 items-start">
                <div className="w-1/2">
                <div className="text-black pt-8 font-bold text-3xl">
                    Transaction List
                </div>

                <button className="text-black font-bold border-gray-400 p-3 mt-6 border-2 rounded-2xl cursor-pointer" onClick={sortReversed}>
                    Switch to {ascending ? "Descending" : "Ascending"}
                </button>
                <div className="text-black border-4 my-8 rounded-xl w-full">
                    <div className="px-4">
                        {transactions.map(transaction => (
                            <div className={transaction.type == "expense" ? `text-red-800` : `text-green-800`}>
                                <div className="gap-24 border-4 my-4 py-4 rounded-xl">
                                    <div>
                                        Category: {transaction.category_name}
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
                </div>
            {/* This is the code for the AI section. This will allow the user to see AI insights about their finances with one click. */}
                {/* This code was AI-generated with ChatGPT to save development time. Basically, this code is just a secondary column on the right of the
                transaction list. It allows the user to fetch some AI analysis about their expenses on button click.*/}
                <div className="sticky top-8 w-1/2">
                    <div>
                        <div className="text-black pt-8 font-bold text-2xl">
                            AI Feedback
                        </div>

                        <button
                            className="text-black font-bold border-gray-400 p-3 mt-6 border-2 rounded-2xl cursor-pointer"
                            onClick={fetchAnalysis}
                        >
                            Get Feedback
                        </button>

                        <div className="mt-9 border-4 rounded-xl p-4 bg-white border-black min-h-[150px]">
                            {analysisLoading && (
                                <p className="text-gray-600">Loading...</p>
                            )}

                            {analysisError && (
                                <p className="text-red-600">{analysisError}</p>
                            )}

                            {!analysisLoading && !analysisError && (
                                <div className="whitespace-pre-wrap text-black text-sm font-semibold">
                                {analysisResponse ?? "No data yet. Click \"Get Feedback\" to fetch AI Feedback."}
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}