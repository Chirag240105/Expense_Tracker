"""
ExpenseVerse AI Service
=======================
FastAPI micro-service for ML-powered financial insights.

AI Provider Priority
--------------------
1. Google Gemini  — if GEMINI_API_KEY is set and the call succeeds
2. OpenAI GPT     — fallback if GEMINI_API_KEY is absent or the Gemini call fails
3. Local fallback — pure Pandas/sklearn answer (no LLM) if both keys are missing

This lets the app work even without any API key, and automatically
switches between providers so you never get a hard failure.

Database
--------
Reads from the unified `transactions` collection (Phase 2 discriminator pattern).
Heavy aggregation is done in MongoDB pipelines, not in-memory Pandas.
"""

from __future__ import annotations

import os
import traceback
from datetime import datetime, timedelta
from typing import Any

import pandas as pd
import numpy as np
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

# Never fall back to a hard-coded URI — force configuration via env
MONGO_URI: str = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017/expense_tracker?replicaSet=rs0",
)
DB_NAME: str = os.getenv("DB_NAME", "expense_tracker")

OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

# ─────────────────────────────────────────────────────────────────────────────
# MongoDB client — shared across all requests
# ─────────────────────────────────────────────────────────────────────────────
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
transactions_col = db["transactions"]   # unified collection (Phase 2)

# ─────────────────────────────────────────────────────────────────────────────
# AI provider helpers
# ─────────────────────────────────────────────────────────────────────────────

def _call_gemini(system_prompt: str, user_message: str) -> str:
    """
    Call Google Gemini (gemini-1.5-flash model).
    Returns the text response or raises an exception.
    """
    import google.generativeai as genai  # type: ignore[import]

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_prompt,
    )
    response = model.generate_content(user_message)
    return response.text


def _call_openai(system_prompt: str, user_message: str) -> str:
    """
    Call OpenAI using the current SDK (openai >= 1.0.0).
    Returns the text response or raises an exception.
    """
    from openai import OpenAI  # type: ignore[import]

    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=600,
        temperature=0.7,
    )
    return response.choices[0].message.content


def llm_respond(system_prompt: str, user_message: str) -> tuple[str, str]:
    """
    Try Gemini first, fall back to OpenAI, then return a local message.

    Returns (response_text, provider_used).
    """
    # 1. Try Gemini
    if GEMINI_API_KEY:
        try:
            text = _call_gemini(system_prompt, user_message)
            return text, "gemini"
        except Exception as exc:
            print(f"[AI] Gemini failed ({exc}), falling back to OpenAI")

    # 2. Try OpenAI
    if OPENAI_API_KEY:
        try:
            text = _call_openai(system_prompt, user_message)
            return text, "openai"
        except Exception as exc:
            print(f"[AI] OpenAI failed ({exc}), using local fallback")

    # 3. Local fallback — no LLM needed
    return (
        "AI providers are unavailable. Showing rule-based analysis instead.",
        "local",
    )


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ExpenseVerse AI Service",
    description="ML and LLM-powered financial insights (Gemini-first, OpenAI fallback)",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Express proxy is the only caller in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────

def _to_object_id(user_id: str) -> ObjectId:
    try:
        return ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail=f"Invalid user ID: {user_id}")


def _get_expense_df(user_id: str) -> pd.DataFrame:
    """
    Pull expense transactions from the unified transactions collection
    using an aggregation pipeline (avoids loading unneeded fields).
    """
    uid = _to_object_id(user_id)
    pipeline = [
        {
            "$match": {
                "userId": uid,
                "type": "expense",
                "isDeleted": False,
            }
        },
        {
            "$project": {
                "_id": 0,
                "amount": {"$toDouble": "$amount"},
                "source": 1,
                "date": 1,
                "categoryId": 1,
                "tags": 1,
                "paymentMethod": 1,
            }
        },
    ]
    docs = list(transactions_col.aggregate(pipeline))
    return pd.DataFrame(docs) if docs else pd.DataFrame()


def _get_income_df(user_id: str) -> pd.DataFrame:
    uid = _to_object_id(user_id)
    pipeline = [
        {
            "$match": {
                "userId": uid,
                "type": "income",
                "isDeleted": False,
            }
        },
        {
            "$project": {
                "_id": 0,
                "amount": {"$toDouble": "$amount"},
                "source": 1,
                "date": 1,
            }
        },
    ]
    docs = list(transactions_col.aggregate(pipeline))
    return pd.DataFrame(docs) if docs else pd.DataFrame()


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    ai_status = []
    if GEMINI_API_KEY:
        ai_status.append("gemini")
    if OPENAI_API_KEY:
        ai_status.append("openai")
    if not ai_status:
        ai_status.append("local-only")

    return {
        "message": "ExpenseVerse AI Service is running",
        "status": "healthy",
        "ai_providers": ai_status,
        "database": DB_NAME,
    }


@app.get("/api/ai/predict-expense/{user_id}")
async def predict_expense(user_id: str):
    """
    Predict next month's total expense.
    Uses linear regression when >= 10 records exist, weighted moving average otherwise.
    """
    try:
        df = _get_expense_df(user_id)

        if df.empty or len(df) < 2:
            return {
                "success": False,
                "message": f"Not enough data ({len(df)} records). Add at least 2 expense entries.",
                "prediction": 0,
                "count": len(df),
            }

        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")

        if len(df) < 10:
            recent_avg = float(df.tail(5)["amount"].mean())
            total_avg = float(df["amount"].mean())
            prediction = recent_avg * 0.7 + total_avg * 0.3
            first_h = float(df.head(max(1, len(df) // 2))["amount"].mean())
            second_h = float(df.tail(max(1, len(df) // 2))["amount"].mean())
            trend = "increasing" if second_h > first_h else "decreasing"
            method = "moving_average"
        else:
            df["month"] = df["date"].dt.to_period("M")
            monthly = df.groupby("month")["amount"].sum().reset_index()
            monthly["month_num"] = range(len(monthly))
            X = monthly[["month_num"]].values
            y = monthly["amount"].values
            model = LinearRegression()
            model.fit(X, y)
            prediction = float(model.predict([[len(monthly)]])[0])
            recent_avg = float(monthly.tail(3)["amount"].mean())
            trend = "increasing" if prediction > recent_avg else "decreasing"
            method = "linear_regression"

        return {
            "success": True,
            "prediction": round(prediction, 2),
            "trend": trend,
            "method": method,
            "message": (
                f"Based on your spending pattern ({method.replace('_', ' ')}), "
                f"you're likely to spend ${round(prediction, 2):.2f} next month."
            ),
            "count": len(df),
        }

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/ai/analyze-spending/{user_id}")
async def analyze_spending(user_id: str):
    """
    Category and cluster breakdown of expenses — heavy math in MongoDB, not Pandas.
    """
    try:
        df = _get_expense_df(user_id)

        if df.empty or len(df) < 2:
            return {
                "success": False,
                "message": f"Not enough data ({len(df)} records).",
                "count": len(df),
            }

        df["date"] = pd.to_datetime(df["date"])

        # Category breakdown
        cat = df.groupby("source")["amount"].agg(["sum", "count", "mean"]).reset_index()
        cat.columns = ["category", "total", "count", "average"]
        total_expense = float(cat["total"].sum())
        cat["percentage"] = (cat["total"] / total_expense * 100).round(2)
        cat = cat.sort_values("total", ascending=False)

        category_breakdown = [
            {
                "category": str(r["category"]),
                "total": round(float(r["total"]), 2),
                "count": int(r["count"]),
                "average": round(float(r["average"]), 2),
                "percentage": round(float(r["percentage"]), 2),
            }
            for _, r in cat.iterrows()
        ]

        # K-means clustering on amount
        clusters: list[dict[str, Any]] = []
        if len(df) >= 5:
            try:
                scaler = StandardScaler()
                X = scaler.fit_transform(df[["amount"]].values)
                n = min(3, max(2, len(df) // 5))
                km = KMeans(n_clusters=n, random_state=42, n_init=10)
                df["cluster"] = km.fit_predict(X)
                p33, p66 = df["amount"].quantile(0.33), df["amount"].quantile(0.66)
                for cid, grp in df.groupby("cluster"):
                    mean_val = float(grp["amount"].mean())
                    clusters.append({
                        "cluster": int(cid),
                        "mean": round(mean_val, 2),
                        "count": int(len(grp)),
                        "type": (
                            "High Spending" if mean_val > p66
                            else "Medium Spending" if mean_val > p33
                            else "Low Spending"
                        ),
                    })
            except Exception as e:
                print(f"[AI] Clustering skipped: {e}")

        top = cat.iloc[0]
        insights = [
            f"Top category: '{top['category']}' at ${round(float(top['total']), 2):.2f} ({round(float(top['percentage']), 1)}%).",
            f"Average transaction: ${round(float(df['amount'].mean()), 2):.2f}.",
            f"Total categories tracked: {len(cat)}.",
        ]
        if len(cat) > 1:
            s = cat.iloc[1]
            insights.append(
                f"Second highest: '{s['category']}' at ${round(float(s['total']), 2):.2f}."
            )

        return {
            "success": True,
            "category_breakdown": category_breakdown,
            "clusters": clusters,
            "insights": insights,
            "total_expense": round(total_expense, 2),
            "average_transaction": round(float(df["amount"].mean()), 2),
            "count": len(df),
        }

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/ai/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    """
    Rule-based savings recommendations, optionally enhanced with an LLM summary.
    """
    try:
        df_exp = _get_expense_df(user_id)
        df_inc = _get_income_df(user_id)

        if df_exp.empty or df_inc.empty:
            return {
                "success": False,
                "message": "Need both income and expense data.",
                "expense_count": len(df_exp),
                "income_count": len(df_inc),
            }

        total_expense = float(df_exp["amount"].sum())
        total_income = float(df_inc["amount"].sum())
        savings_rate = (
            ((total_income - total_expense) / total_income * 100)
            if total_income > 0
            else 0.0
        )

        recommendations: list[dict] = []

        if savings_rate < 0:
            recommendations.append({
                "type": "warning",
                "title": "Spending More Than Income",
                "message": f"Deficit of ${abs(total_income - total_expense):.2f}.",
                "action": "Cut unnecessary expenses immediately.",
            })
        elif savings_rate < 20:
            recommendations.append({
                "type": "warning",
                "title": "Low Savings Rate",
                "message": f"Savings rate is {savings_rate:.1f}%. Target: 20%.",
                "action": "Review and reduce discretionary spending.",
            })
        elif savings_rate < 30:
            recommendations.append({
                "type": "info",
                "title": "Good Savings Rate",
                "message": f"Savings rate of {savings_rate:.1f}% is healthy.",
                "action": "Try to reach 30% for faster goal achievement.",
            })
        else:
            recommendations.append({
                "type": "success",
                "title": "Excellent Savings Rate",
                "message": f"Savings rate of {savings_rate:.1f}% — great work!",
                "action": "Consider investing surplus for compounding returns.",
            })

        cat_totals = df_exp.groupby("source")["amount"].sum()
        for cat, amount in cat_totals.items():
            pct = float(amount / total_expense * 100)
            if pct > 40:
                recommendations.append({
                    "type": "warning",
                    "title": f"High spending: {cat}",
                    "message": f"{pct:.1f}% (${amount:.2f}) on {cat}.",
                    "action": f"Look for ways to reduce {cat} costs.",
                })
            elif pct > 25:
                recommendations.append({
                    "type": "info",
                    "title": f"Watch: {cat}",
                    "message": f"{cat} is {pct:.1f}% of expenses.",
                    "action": f"Monitor {cat} spending closely.",
                })

        # Optional LLM narrative summary (Gemini → OpenAI → local)
        llm_summary = None
        llm_provider = "local"
        if GEMINI_API_KEY or OPENAI_API_KEY:
            system = (
                "You are a concise personal finance advisor. "
                "Give a 2-3 sentence actionable summary based on the data provided. "
                "Use dollar signs, not rupee symbols."
            )
            user_msg = (
                f"Income: ${total_income:.2f}, Expenses: ${total_expense:.2f}, "
                f"Savings rate: {savings_rate:.1f}%. "
                f"Top categories: {', '.join([f'{k} (${v:.2f})' for k, v in cat_totals.nlargest(3).items()])}."
            )
            llm_summary, llm_provider = llm_respond(system, user_msg)

        return {
            "success": True,
            "savings_rate": round(savings_rate, 2),
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "net_savings": round(total_income - total_expense, 2),
            "recommendations": recommendations,
            "llm_summary": llm_summary,
            "ai_provider": llm_provider,
            "expense_count": len(df_exp),
            "income_count": len(df_inc),
        }

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/ai/chat")
async def chatbot(
    user_id: str = Query(..., description="MongoDB user ObjectId"),
    message: str = Query(..., description="User's question"),
):
    """
    Financial chatbot — Gemini first, OpenAI fallback.
    Context is pulled from the user's last 90 days of transactions.
    """
    try:
        uid = _to_object_id(user_id)
        cutoff = datetime.utcnow() - timedelta(days=90)

        # Aggregate context in MongoDB — only what the LLM needs
        pipeline = [
            {
                "$match": {
                    "userId": uid,
                    "isDeleted": False,
                    "date": {"$gte": cutoff},
                }
            },
            {
                "$group": {
                    "_id": "$type",
                    "total": {"$sum": {"$toDouble": "$amount"}},
                    "count": {"$sum": 1},
                }
            },
        ]
        summary = {row["_id"]: row for row in transactions_col.aggregate(pipeline)}
        income_total = round(summary.get("income", {}).get("total", 0), 2)
        expense_total = round(summary.get("expense", {}).get("total", 0), 2)

        # Top 3 expense categories
        cat_pipeline = [
            {
                "$match": {
                    "userId": uid,
                    "type": "expense",
                    "isDeleted": False,
                    "date": {"$gte": cutoff},
                }
            },
            {
                "$group": {
                    "_id": "$source",
                    "total": {"$sum": {"$toDouble": "$amount"}},
                }
            },
            {"$sort": {"total": -1}},
            {"$limit": 3},
        ]
        top_cats = [
            f"{r['_id']} (${r['total']:.2f})"
            for r in transactions_col.aggregate(cat_pipeline)
        ]

        system_prompt = (
            "You are a helpful personal finance assistant called ExpenseVerse AI. "
            "Answer concisely (3-4 sentences max). Use dollar signs, not rupee symbols. "
            f"User's last 90-day context — "
            f"Income: ${income_total}, Expenses: ${expense_total}, "
            f"Top expense categories: {', '.join(top_cats) if top_cats else 'none'}."
        )

        if not (GEMINI_API_KEY or OPENAI_API_KEY):
            return {
                "success": False,
                "response": (
                    "No AI API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY "
                    "in ai_services/.env to enable the chatbot."
                ),
                "ai_provider": "none",
            }

        response_text, provider = llm_respond(system_prompt, message)
        return {
            "success": True,
            "response": response_text,
            "ai_provider": provider,
        }

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
