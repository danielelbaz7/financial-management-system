from flask import Blueprint, jsonify, request
from config import supabase

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
            new_category = {"name": data["category_id"], "user": user_id}
            supabase.table('categories').insert(jsonify(new_category))


        response = supabase.table("transactions").insert(data).execute()
    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()  # 👈 shows full stack trace in your Flask console
        return jsonify({"status": "bad", "message": str(e)}), 400

    return jsonify(response.data), 201

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