import "./index.css"
import "./dashboard-menu.css"
import { useState } from 'react';
import * as React from "react";
import { type ChangeEvent } from 'react';

interface BackdropProps {
    onClose: () => void;
}

export default function TransactionMenu({ onClose }: BackdropProps) {
    const [incomeOrExpense, setIncomeOrExpense] = React.useState("income");
    const [amount, setAmount] = useState<number | null>(null);
    const [error, setError] = useState("");

    const [selectedValue, setSelectedValue] = useState("Choose a Category");
    const options = [{label: "Rent", value: "rent"}, {label: "Food", value: "food"}, {label: "Entertainment", value: "entertainment"}];

    const handleAddTransaction = async (e: React.FormEvent)=> {
        e.preventDefault()

        if(amount === null) {
            setError("Please enter amount")
            return
        }
    }

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);
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
                    <select value={selectedValue} onChange={handleChange} style={{border: "1px solid black"}}>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="What was this for?" className="input-field"/>
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