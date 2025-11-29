from flask import Blueprint, jsonify, request
from config import supabase
import traceback
import os
from openai import OpenAI

ai_bp = Blueprint('ai', __name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@ai_bp.route('/ai/spending', methods=['POST'])
def analyze_spending():
    try:
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        token = token.split(" ")[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        transactions_response = supabase.table("transactions").select(
            "*, category: user_id(name)"
        ).eq("user_id", user_id).execute()
        
        transactions = transactions_response.data
        if not transactions:
            return jsonify({
                "analysis": "No transactions found. Start tracking your spending to get personalized advice!",
                "recommendations": []
            }), 200

        # Calculate spending metrics
        spending_metrics = calculate_spending_metrics(transactions)
        
        # Get AI recommendations
        ai_advice = get_ai_spending_advice(spending_metrics, transactions)
        
        return jsonify({
            "metrics": spending_metrics,
            "analysis": ai_advice["analysis"],
            "recommendations": ai_advice["recommendations"]
        }), 200

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@ai_bp.route('/ai/category', methods=['GET'])
def get_category():
    try:
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        token = token.split(" ")[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        category_filter = request.args.get("category")

        query = supabase.table("transactions").select("*").eq("user_id", user_id)
        if category_filter:
            query = query.eq("category_id", category_filter)
        
        transactions_response = query.execute()
        transactions = transactions_response.data

        if not transactions:
            return jsonify({
                "insight": "No transactions found in this category.",
                "suggestions": []
            }), 200

        # Analyze category spending
        insights = analyze_category_spending(transactions, category_filter)
        
        return jsonify(insights), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@ai_bp.route('/ai/budget', methods=['GET'])
def get_budget():
    try:
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        token = token.split(" ")[1]
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        # Fetch user's transactions (last 3 months)
        transactions_response = supabase.table("transactions").select("*").eq("user_id", user_id).execute()
        transactions = transactions_response.data

        if not transactions:
            return jsonify({
                "recommendation": "No spending history available yet. Start tracking to get budget recommendations!",
                "suggested_budgets": {}
            }), 200

        # Calculate spending by category
        category_spending = {}
        for txn in transactions:
            if txn.get("type") == "expense":
                category = txn.get("category_id", "Uncategorized")
                amount = float(txn.get("amount", 0))
                category_spending[category] = category_spending.get(category, 0) + amount

        # Get AI budget recommendations
        budget_rec = get_budget_recommendations_from_ai(category_spending)
        
        return jsonify(budget_rec), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def calculate_spending_metrics(transactions):
    total_income = 0
    total_expense = 0
    category_spending = {}
    category_count = {}

    for txn in transactions:
        amount = float(txn.get("amount", 0))
        txn_type = txn.get("type", "expense")
        category = txn.get("category_id", "Uncategorized")

        if txn_type == "income":
            total_income += amount
        else:
            total_expense += amount
            category_spending[category] = category_spending.get(category, 0) + amount
            category_count[category] = category_count.get(category, 0) + 1

    # Calculate top spending categories
    top_categories = sorted(
        category_spending.items(), 
        key=lambda x: x[1], 
        reverse=True
    )[:5]

    net = total_income - total_expense
    savings_rate = (net / total_income * 100) if total_income > 0 else 0

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_balance": round(net, 2),
        "savings_rate": round(savings_rate, 2),
        "top_spending_categories": [
            {"category": cat, "amount": round(amt, 2), "transactions": category_count[cat]}
            for cat, amt in top_categories
        ],
        "average_transaction": round(total_expense / len([t for t in transactions if t.get("type") == "expense"]), 2) if any(t.get("type") == "expense" for t in transactions) else 0
    }


def get_ai_spending_advice(metrics, transactions):
    try:
        # Prepare data for AI analysis
        spending_summary = f"""
        User's Spending Summary:
        - Total Income: ${metrics['total_income']}
        - Total Expenses: ${metrics['total_expense']}
        - Net Balance: ${metrics['net_balance']}
        - Savings Rate: {metrics['savings_rate']}%
        - Average Transaction: ${metrics['average_transaction']}
        
        Top Spending Categories:
        {format_top_categories(metrics['top_spending_categories'])}
        """

        prompt = f"""
        {spending_summary}
        
        Based on this spending data, provide:
        1. A brief analysis of the user's spending habits (2-3 sentences)
        2. Three specific, actionable recommendations to improve their finances
        
        Format your response as JSON with keys: "analysis" (string) and "recommendations" (array of strings).
        """

        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "You are a friendly financial advisor helping users improve their spending habits."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        # Process response
        import json
        response_text = response.choices[0].message.content
        
        try:
            ai_response = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            ai_response = {
                "analysis": response_text[:200],
                "recommendations": ["Track your spending regularly", "Set category budgets", "Review monthly trends"]
            }

        return ai_response

    except Exception as e:
        print(f"AI API Error: {e}")
        # Return fallback advice if API fails
        return {
            "analysis": "Keep track of your spending and try to identify patterns to improve your financial health.",
            "recommendations": [
                "Set a monthly budget for each spending category",
                "Review your spending monthly to identify areas to cut back",
                "Try to increase your savings rate by reducing discretionary spending"
            ]
        }


def analyze_category_spending(transactions, category_name):
    total = sum(float(t.get("amount", 0)) for t in transactions)
    count = len(transactions)
    average = total / count if count > 0 else 0

    # Identify trends
    trend = "stable"
    if count >= 2:
        recent_avg = sum(float(t.get("amount", 0)) for t in transactions[:count//2]) / (count//2)
        older_avg = sum(float(t.get("amount", 0)) for t in transactions[count//2:]) / (count - count//2)
        if recent_avg > older_avg * 1.2:
            trend = "increasing"
        elif recent_avg < older_avg * 0.8:
            trend = "decreasing"

    return {
        "category": category_name or "All Categories",
        "total_spent": round(total, 2),
        "transaction_count": count,
        "average_transaction": round(average, 2),
        "trend": trend,
        "suggestions": get_category_suggestions(category_name, total, count, trend)
    }


def get_category_suggestions(category, total, count, trend):
    suggestions = []

    if trend == "increasing":
        suggestions.append(f"Your {category or 'spending'} has been increasing. Consider setting stricter limits.")
    elif trend == "decreasing":
        suggestions.append(f"Great! Your {category or 'spending'} is decreasing. Keep up the good work!")

    if count > 10:
        suggestions.append(f"You have {count} transactions in this category. Look for opportunities to consolidate or reduce frequency.")

    if total > 500:
        suggestions.append(f"This category represents a significant portion of your budget. Review each transaction carefully.")

    if not suggestions:
        suggestions.append(f"Continue monitoring your {category or 'spending'} to maintain healthy financial habits.")

    return suggestions


def get_budget_recommendations_from_ai(category_spending):
    try:
        spending_breakdown = "\n".join(
            [f"- {cat}: ${amt:.2f}" for cat, amt in sorted(category_spending.items(), key=lambda x: x[1], reverse=True)]
        )

        prompt = f"""
        Based on this spending breakdown:
        {spending_breakdown}
        
        Suggest monthly budget allocations for each category. Provide recommendations that help save money while being realistic.
        Format as JSON with key "suggested_budgets" (object with category names as keys and recommended budget amounts as values).
        """

        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "You are a financial advisor providing realistic budget recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )

        import json
        response_text = response.choices[0].message.content
        
        try:
            budget_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback budget recommendations
            budget_data = {
                "suggested_budgets": {
                    cat: round(amt * 0.9, 2)  # Suggest 10% reduction
                    for cat, amt in category_spending.items()
                }
            }

        return budget_data

    except Exception as e:
        print(f"Budget recommendation error: {e}")
        return {
            "suggested_budgets": {
                cat: round(amt * 0.9, 2)
                for cat, amt in category_spending.items()
            }
        }


def format_top_categories(top_categories):
    return "\n".join(
        [f"- {cat['category']}: ${cat['amount']} ({cat['transactions']} transactions)" 
         for cat in top_categories]
    )
