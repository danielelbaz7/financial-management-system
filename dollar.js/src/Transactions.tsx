// src/components/TransactionList.tsx

import React, { useState, useEffect } from 'react';
import { fetchUserTransactions } from './api/transactionApi';

// Define the transaction structure used in the frontend
interface Transaction {
    id: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    const fetchedTransactions = await fetchUserTransactions();

    if (fetchedTransactions) {
      setTransactions(fetchedTransactions);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
    // Only run on mount
  }, []); 

  if (loading) {
    return <div className="text-xl font-semibold text-indigo-500">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-3xl font-bold text-gray-800">Your Transactions</h2>
      
      {transactions.length === 0 ? (
        <div className="text-lg text-gray-500">No transactions recorded yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {transactions.map((t) => (
            <li 
              key={t.id} 
              className={`flex justify-between items-center py-3 ${
                t.type === 'income' ? 'bg-green-50' : 'bg-red-50'
              } px-4 rounded-lg my-2`}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{t.description}</span>
                <span className={`text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'} capitalize`}>
                  {t.type}
                </span>
              </div>
              <span className="text-lg font-bold">
                ${t.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}