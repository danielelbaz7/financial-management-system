from flask import Blueprint, jsonify, request
from config import supabase

users_bp = Blueprint('users', __name__)

@users_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password')

    if not email:
        return jsonify({"error": "Missing email"}), 400
    if not password:
        return jsonify({"error": "Missing password"}), 400

    try:
        result = supabase.auth.sign_up({"email": email, "password": password})

        user_data = result.user.model_dump() if result.user else None
        session_data = result.session.model_dump() if result.session else None

        return jsonify({"user": user_data, "session": session_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        user_data = result.user.model_dump() if result.user else None
        session_data = result.session.model_dump() if result.session else None

        return jsonify({
            "message": "Login successful",
            "user": user_data,
            "session": session_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@users_bp.route('/profile', methods=['GET'])
def get_profile():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401
    
    try:
        user = supabase.auth.get_user(token)
        return jsonify({"user": user}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@users_bp.route('/users', methods=['POST'])
def add_user():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    balance = data.get("balance", 0)

    if not name or not email:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        response = supabase.table("users").insert({
            "name": name,
            "email": email,
            "balance": balance
        }).execute()

        return jsonify(response.data), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500