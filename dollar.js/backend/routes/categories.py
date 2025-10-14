from flask import Blueprint, jsonify, request
from config import supabase

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    res = supabase.table('categories').select('*').execute()
    return jsonify(res.data), 200

@categories_bp.route('/categories', methods=['POST'])
def add_category():
    data = request.get_json()
    res = supabase.table('categories').insert(data).execute()
    return jsonify(res.data), 201