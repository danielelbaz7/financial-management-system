from flask import Blueprint, jsonify, request
from config import supabase

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    response = supabase.table("transactions").select("*").execute()
    return jsonify(response.data), 200

@transactions_bp.route('/transactions', methods=['POST'])
def add_transaction():
    # changes json to contain the correct values for transaction insertion
    data = request.get_json()
    token = request.headers.get("Authorization")
    token=token.split(" ")[1]
    user_id = supabase.auth.get_user(token)
    data["user_id"] = user_id
    print(user_id)
    categories = supabase.table('categories').select('*').execute()

    # category_exists = False
    #
    # for c in categories:
    #     if c["name"] == data["category_id"]:
    #         data["category_id"] = c["name"]
    #         category_exists = True
    #         break
    #
    # if not category_exists:
    #     new_category = {"name": data["category_id"], "user": user_id}
    #     categories.supabase.table('categories').insert(jsonify{})
    #

    #response = supabase.table("transactions").insert(data).execute()
    return jsonify(1), 201

@transactions_bp.route('/transactions/summary', methods=['GET'])
def sum_transactions():
    try:
        response = supabase.table("transactions").select("*, category: category_id(name)").execute()
        transactions = response.data

        if not transactions:
            return jsonify({"message": "No transactions found", "summary": {}}), 200
        
        summary = {}
        for t in transactions:
            category = t.get("category", {}).get("name", "Uncategorized")
            amount = float(t.get("amount", 0))
            summary[category] = summary.get(category, 0) + amount
        
        return jsonify({
            "summary": summary,
            "total_spent": sum(summary.values())
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500