from flask import Blueprint, jsonify, request
from config import supabase
import traceback

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    token = request.headers.get("Authorization")
    token=token.split(" ")[1]
    user_id = supabase.auth.get_user(token).user.id

    response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
    print(response.data)
    return jsonify(response.data), 200

@transactions_bp.route('/transactions', methods=['POST'])
def add_transaction():
    # changes json to contain the correct values for transaction insertion
    try:
        data = request.get_json()
        token = request.headers.get("Authorization")
        token=token.split(" ")[1]
        user_id = supabase.auth.get_user(token).user.id
        #adding user_id category
        data["user_id"] = user_id
        categories = supabase.table('categories').select('*').execute().data

        category_exists = False

        for c in categories:
            if c["name"].lower() == data["category_id"].lower():
                data["category_id"] = c["id"]
                category_exists = True
                break

        if not category_exists:
            new_category = {"name": data["category_id"], "user_id": user_id}
            cat_response = supabase.table('categories').insert(new_category).execute()
            data["category_id"] = cat_response.data[0]["id"]


        response = supabase.table("transactions").insert(data).execute()
    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        return jsonify({"status": "bad", "message": str(e)}), 400

    return jsonify(response.data), 201

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
def edit_transaction(transaction_id):
    try:
        data = request.get_json()
        token = request.headers.get("Authorization")

        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        token = token.split(" ")[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        existing = supabase.table("transactions").select("*").eq("id", transaction_id).eq("user_id", user_id).execute()
        if not existing.data:
            return jsonify({"error": "Transaction not found or unauthorized"}), 404
        
        response = supabase.table("transactions").update(data).eq("id", transaction_id).eq("user_id", user_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
    
@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def remove_transaction(transaction_id):
    try:
        token = request.headers.get("Authorization")

        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        token = token.split(" ")[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        existing = supabase.table("transactions").select("*").eq("id", transaction_id).eq("user_id", user_id).execute()
        if not existing.data:
            return jsonify({"error": "Transaction not found or unauthorized"}), 404
        
        supabase.table("transactions").delete().eq("id", transaction_id).eq("user_id", user_id).execute()
        return jsonify({"message": "Transaction deleted"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)})

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