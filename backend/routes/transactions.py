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