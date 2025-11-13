// src/api/transactionApi.ts (Create this file)

import { getAuthToken } from '../auth/authUtils.tsx'

const API_BASE_URL = 'http://localhost:5000'; // Replace with your actual backend URL

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  // Include other fields returned by your Supabase table
}

export async function fetchUserTransactions(): Promise<Transaction[] | null> {
  const token = await getAuthToken(); // Function from above
  
  if (!token) {
    console.error("User not authenticated.");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 🔑 Crucial: Send the token in the Authorization header
        'Authorization': `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      // Handle HTTP error codes (e.g., 401 Unauthorized, 500 Server Error)
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    // Your Flask endpoint returns a list of transaction objects as JSON
    const data: Transaction[] = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return null;
  }
}