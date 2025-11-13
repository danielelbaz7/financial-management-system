import json, hashlib, datetime as dt
from decimal import Decimal
from collections import defaultdict
from flask import Blueprint, request, jsonify
from config import supabase, gemini_model

ai_bp = Blueprint("ai_bp", __name__, url_prefix="/ai")

def _r2(x): 
    return float(round(Decimal(x), 2))

def _parse_date(s, default=None):
    try:
        return dt.date.fromisoformat(s)
    except Exception:
        return default

def _date_range_from_query():
    q = request.args
    end = _parse_date(q.get("end")) or dt.date.today()
    start = _parse_date(q.get("start")) or end.replace(day=1)
    if start > end:
        start, end = end, start
    return start, end

def _cache_key(user_id, start, end):
    return hashlib.sha256(f"{user_id}:{start}:{end}".encode()).hexdigest()[:16]

def _get_user_id():
    return request.headers.get("X-User-Id")

def _fetch_category_map(user_id):
    resp = (supabase.table("categories")
            .select("id,name")
            .eq("user", user_id)
            .execute())
    rows = resp.data or []
    return {r["id"]: (r.get("name") or "Uncategorized") for r in rows}

def _fetch_transactions(user_id, start, end, cat_map):
    resp = (supabase.table("transactions")
            .select("id,date,amount,category_id,description,type")
            .eq("user_id", user_id)
            .gte("date", start.isoformat())
            .lte("date", end.isoformat())
            .order("date", desc=False)
            .execute())
    rows = resp.data or []
    txns = []
    for r in rows:
        amt = float(r["amount"])
        ttype = (r.get("type") or "").lower()
        if ttype.startswith("exp") and amt > 0:
            amt = -amt
        if ttype.startswith("inc") and amt < 0:
            amt = -amt
        txns.append({
            "id": r["id"],
            "date": r["date"],
            "amount": amt,
            "category": cat_map.get(r.get("category_id"), "Uncategorized"),
            "description": r.get("description") or ""
        })
    return txns

def _detect_recurring(txns):
    def key_of(t):
        base = (t["description"] or "").strip().lower() or t["category"].lower()
        return (base, _r2(abs(t["amount"])))
    buckets = defaultdict(list)
    for t in txns:
        buckets[key_of(t)].append(t)

    recurring, seen = [], set()
    for (base, amt), items in buckets.items():
        if len(items) < 2:
            continue
        dates = sorted(dt.date.fromisoformat(i["date"]) for i in items)
        gaps = [abs((dates[i] - dates[i-1]).days) for i in range(1, len(dates))]
        if any(25 <= g <= 35 for g in gaps):
            name = base if len(base) <= 30 else base[:27] + "..."
            k = (name, amt, "monthly")
            if k not in seen:
                recurring.append({"name": name, "amount": amt, "cadence": "monthly"})
                seen.add(k)
    return recurring

def _detect_anomalies(txns):
    by_cat = defaultdict(list)
    for t in txns:
        if t["amount"] < 0:
            by_cat[t["category"]].append(abs(t["amount"]))
    anomalies = []
    for cat, vals in by_cat.items():
        if len(vals) < 5:
            continue
        vals.sort()
        mid = len(vals) // 2
        med = vals[mid] if len(vals) % 2 else 0.5 * (vals[mid-1] + vals[mid])
        for t in txns:
            if t["category"] == cat and t["amount"] < 0:
                if abs(t["amount"]) > 2 * med and abs(t["amount"]) > 100:
                    anomalies.append({
                        "date": t["date"],
                        "label": t["description"] or cat,
                        "amount": _r2(t["amount"]),
                        "note": f">{_r2(2*med)} (2× {cat} median)"
                    })
    return anomalies[:5]

def _compute_metrics(txns):
    income = sum(t["amount"] for t in txns if t["amount"] > 0)
    expenses = sum(-t["amount"] for t in txns if t["amount"] < 0)
    savings = income - expenses
    rate = (savings / income) if income > 0 else 0.0

    by_cat = defaultdict(float)
    for t in txns:
        if t["amount"] < 0:
            by_cat[t["category"]] += -t["amount"]

    top = sorted(
        [{"category": c, "amount": _r2(a)} for c, a in by_cat.items()],
        key=lambda x: x["amount"],
        reverse=True
    )[:5]

    return {
        "income": _r2(income),
        "expenses": _r2(expenses),
        "savings": _r2(savings),
        "savings_rate": _r2(rate),
        "top_categories": top,
        "recurring": _detect_recurring(txns),
        "anomalies": _detect_anomalies(txns),
    }

def _build_prompt(metrics, period):
    return f"""
You are a cautious financial coach. Using ONLY the facts below, write short, specific guidance.
No investing picks, no credit card churning, and no legal/tax advice.

FACTS (for {period["start"]} to {period["end"]}):
- Income: ${metrics["income"]}
- Expenses: ${metrics["expenses"]}
- Savings: ${metrics["savings"]}
- Savings rate: {metrics["savings_rate"]*100:.1f}%
- Top categories: {metrics["top_categories"]}
- Recurring: {metrics["recurring"]}
- Anomalies: {metrics["anomalies"]}

Return STRICT JSON only:
{{
  "summary": "1-3 sentences.",
  "tips": [{{"title":"...", "detail":"..."}}, ...],
  "caveats": ["Educational guidance only; not financial advice."]
}}
"""

def _gemini_json(prompt):
    if gemini_model is None:
        return {"summary": "Gemini client not configured.", "tips": [], "caveats": ["Set GEMINI_API_KEY on the server."]}
    resp = gemini_model.generate_content(prompt)
    txt = (resp.text or "").strip()
    try:
        if txt.startswith("```"):
            lines = txt.splitlines()
            if lines[0].startswith("```"): lines = lines[1:]
            if lines and lines[-1].startswith("```"): lines = lines[:-1]
            if lines and lines[0].lower() == "json": lines = lines[1:]
            txt = "\n".join(lines).strip()
        return json.loads(txt)
    except Exception:
        return {"summary": txt[:600], "tips": [], "caveats": ["Educational guidance only; not financial advice."]}


@ai_bp.route("/finance-advice", methods=["POST"])
def finance_advice():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    start, end = _date_range_from_query()
    period = {"start": start.isoformat(), "end": end.isoformat()}

    cat_map = _fetch_category_map(user_id)
    txns = _fetch_transactions(user_id, start, end, cat_map)
    metrics = _compute_metrics(txns)

    prompt = _build_prompt(metrics, period)
    ai_json = _gemini_json(prompt)

    return jsonify({
        "period": period,
        "metrics": metrics,
        "ai": ai_json,
        "cache_key": _cache_key(user_id, period["start"], period["end"])
    }), 200