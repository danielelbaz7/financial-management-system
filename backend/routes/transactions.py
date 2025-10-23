from flask import Blueprint, jsonify, request
from config import supabase

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    response = supabase.table("transactions").select("*").execute()
    return jsonify(response.data), 200

@transactions_bp.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    response = supabase.table("transactions").insert(data).execute()
    return jsonify(response.data), 201

@transactions_bp.route('/transactions/summary', methods=['GET'])
def sum_transactions():
    try:
        response = supabase.table("transaction").select("*").execute()
        transactions = response.data

        if not transactions:
            return jsonify({"message": "No transactions found", "summary": {}}), 200
        
        summary = {}
        for t in transactions:
            category = t.get("category", "Uncategorized")
            amount = float(t.get("amount", 0))
            summary[category] = summary.get(category, 0) + amount
        
        return jsonify({
            "summary": summary,
            "total_spent": sum(summary.values())
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500