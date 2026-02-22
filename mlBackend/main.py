import re
import math
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- 1. CONFIGURATION ---
MODEL_PATH = 'password_strength_model_FFinal.pkl'
SHAP_RULES_PATH = 'shap_recommendations.json'
STRENGTH_MAP = {0: "Weak", 1: "Medium", 2: "Strong"}

# --- 2. INITIALIZE APP ---
app = FastAPI(title="KeyShard Backend", description="XGBoost Password Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. LOAD ASSETS ---
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

try:
    with open(SHAP_RULES_PATH, 'r') as f:
        shap_data = json.load(f)
        SHAP_RULES = shap_data.get('rules', []) if isinstance(shap_data, dict) else shap_data
    print("✅ SHAP rules loaded successfully.")
except Exception as e:
    print(f"❌ Error loading SHAP rules: {e}")
    SHAP_RULES = []

# --- 4. FEATURE EXTRACTION ---
# (Keeping helper functions compact for readability)
def pass_entropy(x):
    if not x: return 0
    freq = pd.Series(list(str(x))).value_counts()
    prob = freq / len(str(x))
    return -np.sum(prob * np.log2(prob))

def max_repeated(x):
    if not x: return 0
    return max((len(m.group(0)) for m in re.finditer(r'(.)\1*', str(x))), default=0)

def transitions(x):
    if not x: return 0
    x = str(x)
    def char_type(c):
        if c.islower(): return "l"
        if c.isupper(): return "u"
        if c.isdigit(): return "d"
        return "s"
    return sum(char_type(x[i]) != char_type(x[i+1]) for i in range(len(x)-1))

def check_common_root(x):
    common_roots = ['password', 'qwerty', 'admin', 'welcome', 'login', 'google', 'iloveyou', 'p@ss', 'pass', 'monkey', 'dragon']
    x_lower = str(x).lower()
    return 1 if any(root in x_lower for root in common_roots) else 0

def leet_count(x):
    return sum(c in "@$!013457" for c in str(x))

def shape_score(x):
    if not x: return 0
    shape = ""
    for char in str(x):
        if char.isupper(): shape += "U"
        elif char.islower(): shape += "L"
        elif char.isdigit(): shape += "D"
        else: shape += "S"
    chunks = set([shape[i:i+2] for i in range(len(shape)-1)])
    return len(chunks)

def get_pattern_score(x):
    x_lower = str(x).lower()
    score = 0
    sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm']
    for seq in sequences:
        for i in range(len(seq) - 2):
            if seq[i:i+3] in x_lower: score += 1
            if seq[i:i+3][::-1] in x_lower: score += 1
    return score

def extract_features(pwd):
    p = str(pwd)
    l_count = len(re.findall(r'[a-z]', p))
    u_count = len(re.findall(r'[A-Z]', p))
    d_count = len(re.findall(r'[0-9]', p))
    s_count = len(re.findall(r'[^a-zA-Z0-9]', p))
    has_year = 1 if re.search(r'(19|20)\d{2}', p) else 0
    starts_upper = 1 if p and p[:1].isupper() else 0
    ends_digit = 1 if p and p[-1:].isdigit() else 0
    
    features = {
        'length': len(p),
        'lowercase_count': l_count,
        'uppercase_count': u_count,
        'digit_count': d_count,
        'special_count': s_count,
        'entropy': pass_entropy(p),
        'transitions': transitions(p),
        'max_repeat': max_repeated(p),
        'leet_count': leet_count(p),
        'is_common_root': check_common_root(p),
        'shape_complexity': shape_score(p),
        'pattern_intensity': get_pattern_score(p),
        'habit_score': has_year + starts_upper + ends_digit,
        'char_diversity': (1 if l_count > 0 else 0) + (1 if u_count > 0 else 0) + 
                          (1 if d_count > 0 else 0) + (1 if s_count > 0 else 0)
    }
    
    final_features_order = [
        'length', 'lowercase_count', 'uppercase_count', 'digit_count', 'special_count',
        'entropy', 'transitions', 'max_repeat', 'leet_count', 'is_common_root',
        'shape_complexity', 'pattern_intensity', 'habit_score', 'char_diversity'
    ]
    
    df = pd.DataFrame([features])
    return df[final_features_order]

# --- 5. RECOMMENDATION LOGIC ---
def get_recommendations(features_df, email_warning=False):
    recommendations = []
    
    # 1. Add Email Warning if applicable
    if email_warning:
        recommendations.append("Do not use your email address or username in your password.")

    # 2. SHAP Rules Logic
    for rule in SHAP_RULES:
        feature = rule.get('feature')
        target = rule.get('target')
        condition = rule.get('condition')
        message = rule.get('message')
        
        if feature in features_df.columns:
            val = features_df.iloc[0][feature]
            if condition == "<" and val < target:
                recommendations.append(message)
    
    if not recommendations:
        recommendations.append("Increase length and complexity.")
        
    return list(set(recommendations))[:4]

# --- 6. API ENDPOINTS ---

class PasswordRequest(BaseModel):
    password: str
    email: str | None = None  # <--- NEW: Optional Email Field

@app.post("/analyze")
def analyze_password(request: PasswordRequest):
    pwd = request.password
    email = request.email
    
    if not pwd:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    try:
        # 1. Extract Features
        features_df = extract_features(pwd)
        
        # Pull out values for your specific logic (using names for safety)
        length = features_df['length'].iloc[0]
        digits = features_df['digit_count'].iloc[0]
        special = features_df['special_count'].iloc[0]

        # 2. Logic Flow
        score_index = 0
        email_warning_triggered = False

        # CHECK A: Email Similarity (Highest Priority)
        # We split email at '@' to get the username part (e.g., "john" from "john@gmail.com")
        if email and email.split('@')[0].lower() in pwd.lower():
            score_index = 0 # Force Weak
            strength_label = "Weak"
            email_warning_triggered = True
        
        else:
            # CHECK B: Your Custom Heuristics (If email didn't fail)
            
            # Rule: If no digits, no special chars, and length < 10 -> Force Weak
            if digits == 0 and special == 0 and length < 10:
                strength_label = "Weak"
                score_index = 0
            
            # Rule: If length is between 10 and 20 -> Force Medium
            # (Note: This bypasses the ML model for this specific range)
            elif 10 <= length <= 20:
                strength_label = "Medium"
                score_index = 1
            
            # Rule: Otherwise -> Use XGBoost Model
            else:
                if model:
                    pred_idx = model.predict(features_df)[0]
                    score_index = int(pred_idx)
                    strength_label = STRENGTH_MAP.get(score_index, "Unknown")
                else:
                    strength_label = "Error (Model Missing)"

        # 3. Recommendations
        recs = []
        if strength_label != "Strong":
            recs = get_recommendations(features_df, email_warning=email_warning_triggered)
        else:
            recs = ["Great password! Keep it safe."]

        return {
            "password_length": len(pwd),
            "strength": strength_label,
            "score_index": score_index,
            "recommendations": recs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)