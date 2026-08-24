from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import openai  

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.post("/api/ai/chatbot")
async def chatbot_advisor(query: str, user_id: str):
    # Simple context with past expenses
    expenses = list(expenses_collection.find({"userId": ObjectId(user_id)}))
    total_spent = sum(e['amount'] for e in expenses)
    categories = set(e['source'] for e in expenses)
    context = f"User has spent ₹{total_spent} across categories: {', '.join(categories)}."
    
    messages = [
        {"role": "system", "content": f"You are a personal finance assistant. Context: {context}"},
        {"role": "user", "content": query},
    ]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # Or gpt-4 if available
        messages=messages
    )
    return {"response": response.choices[0].message['content']}


MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://pandeychirag163_db_user:ExpenseUser12@cluster0.pxvkezs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(MONGO_URI)
db = client['test']
expenses_collection = db['expenses']
incomes_collection = db['incomes']


MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "AI Service is running", "status": "healthy"}

@app.get("/api/ai/predict-expense/{user_id}")
async def predict_expense(user_id: str):
    """Predict next month's expense - FIXED VERSION"""
    try:
        
        user_obj_id = ObjectId(user_id)
        expenses = list(expenses_collection.find({"userId": user_obj_id}))
        
        print(f"✅ DEBUG: Found {len(expenses)} expenses for user {user_id}")
        
        if len(expenses) < 2:
            return {
                "success": False,
                "message": f"Not enough data. Found {len(expenses)} expense records, need at least 2.",
                "prediction": 0,
                "count": len(expenses)
            }
        
        
        df = pd.DataFrame(expenses)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        

        if len(expenses) < 10:
            recent_avg = df.tail(min(5, len(df)))['amount'].mean()
            total_avg = df['amount'].mean()
            prediction = (recent_avg * 0.7 + total_avg * 0.3)
            
           
            if len(df) >= 2:
                first_half = df.head(max(1, len(df)//2))['amount'].mean()
                second_half = df.tail(max(1, len(df)//2))['amount'].mean()
                trend = "increasing" if second_half > first_half else "decreasing"
            else:
                trend = "stable"
            
            print(f"✅ Prediction: {prediction}, Trend: {trend}")
            
            return {
                "success": True,
                "prediction": round(float(prediction), 2),
                "trend": trend,
                "message": f"Based on your spending pattern, you're likely to spend ₹{round(prediction, 2)} next month.",
                "method": "moving_average",
                "count": len(expenses)
            }
        
       
        df['month'] = df['date'].dt.to_period('M')
        monthly_expenses = df.groupby('month')['amount'].sum().reset_index()
        monthly_expenses['month_num'] = range(len(monthly_expenses))
        
        X = monthly_expenses[['month_num']].values
        y = monthly_expenses['amount'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        next_month_num = len(monthly_expenses)
        prediction = model.predict([[next_month_num]])[0]
        
        recent_avg = monthly_expenses.tail(3)['amount'].mean()
        trend = "increasing" if prediction > recent_avg else "decreasing"
        
        return {
            "success": True,
            "prediction": round(float(prediction), 2),
            "trend": trend,
            "message": f"Based on your spending pattern, you're likely to spend ₹{round(prediction, 2)} next month.",
            "method": "linear_regression",
            "count": len(expenses)
        }
        
    except Exception as e:
        print(f"❌ ERROR in predict_expense: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/analyze-spending/{user_id}")
async def analyze_spending(user_id: str):
    """Analyze spending patterns - FIXED VERSION"""
    try:
        user_obj_id = ObjectId(user_id)
        expenses = list(expenses_collection.find({"userId": user_obj_id}))
        
        print(f"✅ DEBUG: Found {len(expenses)} expenses for analysis")
        
        if len(expenses) < 2:
            return {
                "success": False,
                "message": f"Not enough data. Found {len(expenses)} expense records, need at least 2.",
                "count": len(expenses)
            }
        
        df = pd.DataFrame(expenses)
        df['date'] = pd.to_datetime(df['date'])
        
     
        category_spending = df.groupby('source')['amount'].agg(['sum', 'count', 'mean']).reset_index()
        category_spending.columns = ['category', 'total', 'count', 'average']
        
        total_expense = float(category_spending['total'].sum())
        category_spending['percentage'] = (category_spending['total'] / total_expense * 100).round(2)
        category_spending = category_spending.sort_values('total', ascending=False)
        
        
        category_breakdown = []
        for _, row in category_spending.iterrows():
            category_breakdown.append({
                'category': str(row['category']),
                'total': float(row['total']),
                'count': int(row['count']),
                'average': float(row['average']),
                'percentage': float(row['percentage'])
            })
        
        clusters = []
        if len(df) >= 5:
            try:
                features = df[['amount']].values
                scaler = StandardScaler()
                features_scaled = scaler.fit_transform(features)
                
                n_clusters = min(2, max(2, len(df) // 3))
                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                df['cluster'] = kmeans.fit_predict(features_scaled)
                
                cluster_analysis = df.groupby('cluster')['amount'].agg(['mean', 'count']).reset_index()
                cluster_analysis['type'] = cluster_analysis['mean'].apply(
                    lambda x: 'High Spending' if x > df['amount'].quantile(0.66) 
                    else 'Medium Spending' if x > df['amount'].quantile(0.33) 
                    else 'Low Spending'
                )
                
                for _, row in cluster_analysis.iterrows():
                    clusters.append({
                        'cluster': int(row['cluster']),
                        'mean': float(row['mean']),
                        'count': int(row['count']),
                        'type': str(row['type'])
                    })
            except Exception as e:
                print(f"⚠️ Clustering error: {e}")
        
       
        top_category = category_spending.iloc[0]
        avg_transaction = float(df['amount'].mean())
        
        insights = [
            f"Your top spending category is '{top_category['category']}' at ₹{round(float(top_category['total']), 2)} ({round(float(top_category['percentage']), 1)}% of total).",
            f"You make an average of {round(float(category_spending['count'].mean()), 1)} transactions per category.",
            f"Your average transaction amount is ₹{round(avg_transaction, 2)}."
        ]
        
        if len(category_spending) > 1:
            second_category = category_spending.iloc[1]
            insights.append(f"Your second highest spending is on '{second_category['category']}' at ₹{round(float(second_category['total']), 2)}.")
        
        print(f"✅ Analysis complete: {len(category_breakdown)} categories, {len(insights)} insights")
        
        return {
            "success": True,
            "category_breakdown": category_breakdown,
            "clusters": clusters,
            "insights": insights,
            "total_expense": round(total_expense, 2),
            "average_transaction": round(avg_transaction, 2),
            "count": len(expenses)
        }
        
    except Exception as e:
        print(f"❌ ERROR in analyze_spending: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    """Generate personalized financial recommendations - FIXED VERSION"""
    try:
        user_obj_id = ObjectId(user_id)
        expenses = list(expenses_collection.find({"userId": user_obj_id}))
        incomes = list(incomes_collection.find({"userId": user_obj_id}))
        
        print(f"✅ DEBUG: Found {len(expenses)} expenses and {len(incomes)} incomes")
        
        if not expenses or not incomes:
            return {
                "success": False,
                "message": f"Need both income and expense data. Found {len(expenses)} expenses and {len(incomes)} incomes.",
                "expense_count": len(expenses),
                "income_count": len(incomes)
            }
        
        total_expense = float(sum(e['amount'] for e in expenses))
        total_income = float(sum(i['amount'] for i in incomes))
        
        if total_income == 0:
            savings_rate = 0.0
        else:
            savings_rate = float(((total_income - total_expense) / total_income * 100))
        
        recommendations = []
        
        # Savings rate analysis
        if savings_rate < 0:
            recommendations.append({
                "type": "warning",
                "title": "⚠️ Spending More Than Income",
                "message": f"You're spending more than you earn. Your deficit is ₹{round(abs(total_income - total_expense), 2)}.",
                "action": "Review your expenses immediately and cut unnecessary spending."
            })
        elif savings_rate < 20:
            recommendations.append({
                "type": "warning",
                "title": "Low Savings Rate",
                "message": f"Your savings rate is {round(savings_rate, 1)}%. Financial experts recommend saving at least 20% of income.",
                "action": "Review your expenses and identify areas to cut back."
            })
        elif savings_rate >= 20 and savings_rate < 30:
            recommendations.append({
                "type": "info",
                "title": "Good Savings Rate",
                "message": f"Your savings rate of {round(savings_rate, 1)}% is healthy. Consider increasing it to 30% for faster goal achievement.",
                "action": "Look for additional income sources or optimize major expenses."
            })
        else:
            recommendations.append({
                "type": "success",
                "title": "Excellent Savings Rate",
                "message": f"Your savings rate of {round(savings_rate, 1)}% is excellent! You're on track for financial security.",
                "action": "Consider investing your savings for better returns."
            })
        
       
        df_expenses = pd.DataFrame(expenses)
        category_totals = df_expenses.groupby('source')['amount'].sum()
        
        for category, amount in category_totals.items():
            percentage = float((amount / total_expense * 100))
            if percentage > 40:
                recommendations.append({
                    "type": "warning",
                    "title": f"High spending in {category}",
                    "message": f"You're spending {round(percentage, 1)}% (₹{round(float(amount), 2)}) on {category}.",
                    "action": f"Consider reducing {category} expenses to improve your budget balance."
                })
            elif percentage > 25:
                recommendations.append({
                    "type": "info",
                    "title": f"Moderate spending in {category}",
                    "message": f"{category} takes up {round(percentage, 1)}% of your expenses.",
                    "action": f"Monitor your {category} spending to ensure it stays reasonable."
                })
        
        if len(recommendations) == 1:
            recommendations.append({
                "type": "info",
                "title": "Track Your Progress",
                "message": "Keep adding more transactions to get better AI insights and recommendations.",
                "action": "Aim to record all your income and expenses for at least a month."
            })
        
        print(f"✅ Recommendations complete: Savings rate {savings_rate}%, {len(recommendations)} recommendations")
        
        return {
            "success": True,
            "savings_rate": round(savings_rate, 2),
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "net_savings": round(total_income - total_expense, 2),
            "recommendations": recommendations,
            "expense_count": len(expenses),
            "income_count": len(incomes)
        }
        
    except Exception as e:
        print(f"❌ ERROR in recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
