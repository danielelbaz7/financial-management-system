from flask import Blueprint, request, jsonify
from collections import defaultdict
import datetime as dt, json
from config import supabase, gemini_model

ai_bp = Blueprint("ai_bp", __name__)

def get_user_id():
    return request.headers.get("X-User-Id")

def date_range():
    q = request.args
    end = dt.date.fromisoformat(q.get("end")) if q.get("end") else dt.date.today()
    start = dt.date.fromisoformat(q.get("start")) if q.get("start") else (end - dt.timedelta(days=30))
    return start, end

def get_transactions(user_id, start, end):
    resp = (supabase.table("transactions")
        .select("id,date,amount,description,type,category:categories(name)")
        .eq("user_id", user_id)
        .gte("date", start.isoformat())
        .lte("date", end.isoformat())
        .order("date", desc=False)
        .execute())
    rows = resp.data or []
    transactions = []
    for r in rows:
        amt = float(r["amount"])
        ttype = (r.get("type") or "").lower()
        if ttype.startswith("exp"): amt = -abs(amt)
        elif ttype.startswith("inc"): amt =  abs(amt)
        transactions.append({
            "id": r["id"],
            "date": r["date"],
            "amount": amt,
            "category": (r.get("category") or {}).get("name", "Uncategorized"),
            "description": r.get("description") or ""
        })
    return transactions

def compute_metrics(transactions):
    income   = sum(t["amount"] for t in transactions if t["amount"] > 0)
    expenses = sum(-t["amount"] for t in transactions if t["amount"] < 0)
    savings  = income - expenses
    rate     = (savings / income) if income > 0 else 0.0

    by_cat = defaultdict(float)
    for t in transactions:
        if t["amount"] < 0:
            by_cat[t["category"]] += -t["amount"]
    top = sorted(
        [{"category": c, "amount": round(a, 2)} for c, a in by_cat.items()],
        key=lambda x: x["amount"], reverse=True
    )[:5]

    return {
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "savings": round(savings, 2),
        "savings_rate": round(rate, 2),
        "top_categories": top
    }

def build_prompt(metrics, period):
    return f"""You are a cautious financial coach. You provide your advice in PLAIN ENGLISH

Use ONLY the facts below to give BRIEF and SPECIFIC tips.
No investment advice, no credit card churning, and no tax/legal advice.

FACTS for the period {period["start"]} to {period["end"]}:
- Income: ${metrics["income"]}
- Expenses: ${metrics["expenses"]}
- Savings: ${metrics["savings"]}
- Savings rate: {metrics["savings_rate"]*100:.1f}%
- Top expense categories: {metrics["top_categories"]}

Write 1–3 sentences that:
- Summarize how this person's finances look for this period.
- Give 1–2 concrete, practical suggestions to improve their situation.

Return PLAIN TEXT only.
Do NOT return JSON.
Do NOT wrap your answer in ``` or any other formatting.
Do NOT include headings or bullet points."""

def call_gemini(prompt_text):
    if not gemini_model:
        return {"summary": "Gemini not configured.", "tips": [], "caveats": ["Set GEMINI_API_KEY."]}
    resp = gemini_model.generate_content(prompt_text)
    txt = (getattr(resp, "text", "") or "").strip()
    try:
        return json.loads(txt)
    except Exception:
        return {"summary": txt[:400], "tips": [], "caveats": ["Educational guidance only; not financial advice."]}

@ai_bp.route("/finance-advice", methods=["GET"])
def finance_advice():
    print("HI")
    token = request.headers.get("Authorization")
    token = token.split(" ")[1]
    uid = supabase.auth.get_user(token).user.id
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    start, end = date_range()
    period = {"start": start.isoformat(), "end": end.isoformat()}

    transactions = get_transactions(uid, start, end)
    m = compute_metrics(transactions)
    ai = call_gemini(build_prompt(m, period))

    return jsonify({"period": period, "metrics": m, "ai": ai}), 200