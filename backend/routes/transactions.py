from flask import Blueprint, jsonify, request
from config import supabase
import traceback

transactions_bp = Blueprint('transactions', __name__)
#allows users to pull transactions
@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    #takes user id from bearer token
    token = request.headers.get("Authorization")
    token=token.split(" ")[1]
    user_id = supabase.auth.get_user(token).user.id

    #figures out whether the user is an admin. if they are, pull ALL transactions, otherwise only transactions
    #for that user. security ensured as this is only in the backend which users cannot access
    admin_DB = supabase.table("users").select("admin").eq("id", user_id).execute()
    isAdmin = admin_DB.data[0]['admin']

    if(isAdmin):
        response = supabase.table("transactions").select("*").execute()
    else:
        response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
    return jsonify(response.data), 200

@transactions_bp.route('/transactions', methods=['POST'])
def add_transaction():
    # changes json to contain the correct values for transaction insertion
    try:
        data = request.get_json()
        token = request.headers.get("Authorization")
        token = token.split(" ")[1]
        user_id = supabase.auth.get_user(token).user.id
        #adding user_id category
        data["user_id"] = user_id
        categories = supabase.table('categories').select('*').execute().data

        category_exists = False

        #if the category exists in our db already, count it as that one
        for c in categories:
            if c["name"].lower() == data["category_name"].lower():
                category_exists = True
                break

        #else, create a new category
        if not category_exists:
            new_category = {"name": data["category_name"], "user_id": user_id}
            supabase.table('categories').insert(new_category).execute()

        #actually insert the transaction
        response = supabase.table("transactions").insert(data).execute()
    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "bad", "message": str(e)}), 400

    return jsonify(response.data), 201

#pulls transactions and allows the user to edit it. for planned future update, not currently in use
@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
def edit_transaction(transaction_id):
    try:
        data = request.get_json()
        token = request.headers.get("Authorization")

        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        #gets user id to find the correct transaction
        token = token.split(" ")[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        existing = supabase.table("transactions").select("*").eq("id", transaction_id).eq("user_id", user_id).execute()
        if not existing.data:
            return jsonify({"error": "Transaction not found or unauthorized"}), 404
        #updaters transactions with new data
        response = supabase.table("transactions").update(data).eq("id", transaction_id).eq("user_id", user_id).execute()
        return jsonify(response.data), 200
    #manages errors
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
#same as before, but instead of updating, we simply remove the transaction
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

#this is for seeing the total net balance of all transactions
@transactions_bp.route('/transactions/summary', methods=['GET'])
def sum_transactions():
    try:
        #take all transactions
        response = supabase.table("transactions").select("*, category: category_id(name)").execute()
        transactions = response.data

        if not transactions:
            return jsonify({"message": "No transactions found", "summary": {}}), 200

        #adds either positive or negative to total balance whether expense or income
        summary = {}
        for t in transactions:
            category = t.get("category", {}).get("name", "Uncategorized")
            amount = float(t.get("amount", 0))
            summary[category] = summary.get(category, 0) + amount

        #return balance if successfully computed, return error otherwise
        return jsonify({
            "summary": summary,
            "total_spent": sum(summary.values())
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500