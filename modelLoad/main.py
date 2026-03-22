import re
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- 1. CONFIGURATION ---
MODEL_PATH      = 'password_strength_model_v2.pkl'
SHAP_RULES_PATH = 'shap_recommendations_v2.json'
WEAK_THRESHOLD  = 0.41   # if P(Weak) >= this, force Weak regardless of argmax
STRENGTH_MAP    = {0: "Weak", 1: "Medium", 2: "Strong"}

# --- 2. INITIALIZE APP ---
app = FastAPI(
    title="KeyShard Backend",
    description="XGBoost Password Analysis API (v2 — combined labeling)"
)

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
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

try:
    with open(SHAP_RULES_PATH, 'r') as f:
        shap_data = json.load(f)
        # Supports both {rules: [...]} format and bare list format
        SHAP_RULES = shap_data.get('rules', []) if isinstance(shap_data, dict) else shap_data
    print("SHAP rules loaded successfully.")
except Exception as e:
    print(f"Error loading SHAP rules: {e}")
    SHAP_RULES = []

# --- 4. FEATURE EXTRACTION ---

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
    common_roots = [
        'password', 'qwerty', 'admin', 'welcome', 'login',
        'google', 'iloveyou', 'p@ss', 'pass', 'monkey', 'dragon'
    ]
    x_lower = str(x).lower()
    return 1 if any(root in x_lower for root in common_roots) else 0

def leet_count(x):
    return sum(c in "@$!013457" for c in str(x))

def shape_score(x):
    if not x: return 0
    shape = ""
    for char in str(x):
        if char.isupper():   shape += "U"
        elif char.islower(): shape += "L"
        elif char.isdigit(): shape += "D"
        else:                shape += "S"
    chunks = set([shape[i:i+2] for i in range(len(shape)-1)])
    return len(chunks)

def get_pattern_score(x):
    x_lower = str(x).lower()
    score = 0
    sequences = [
        'abcdefghijklmnopqrstuvwxyz', '0123456789',
        'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
    ]
    for seq in sequences:
        for i in range(len(seq) - 2):
            if seq[i:i+3] in x_lower: score += 1
            if seq[i:i+3][::-1] in x_lower: score += 1
    return score

def extract_features(pwd):
    p        = str(pwd)
    l_count  = len(re.findall(r'[a-z]', p))
    u_count  = len(re.findall(r'[A-Z]', p))
    d_count  = len(re.findall(r'[0-9]', p))
    s_count  = len(re.findall(r'[^a-zA-Z0-9]', p))
    has_year      = 1 if re.search(r'(19|20)\d{2}', p) else 0
    starts_upper  = 1 if p and p[:1].isupper() else 0
    ends_digit    = 1 if p and p[-1:].isdigit() else 0

    features = {
        'length':           len(p),
        'lowercase_count':  l_count,
        'uppercase_count':  u_count,
        'digit_count':      d_count,
        'special_count':    s_count,
        'entropy':          pass_entropy(p),
        'transitions':      transitions(p),
        'max_repeat':       max_repeated(p),
        'leet_count':       leet_count(p),
        'is_common_root':   check_common_root(p),
        'shape_complexity': shape_score(p),
        'pattern_intensity':get_pattern_score(p),
        'habit_score':      has_year + starts_upper + ends_digit,
        'char_diversity':   (
            (1 if l_count > 0 else 0) + (1 if u_count > 0 else 0) +
            (1 if d_count > 0 else 0) + (1 if s_count > 0 else 0)
        )
    }

    feature_order = [
        'length', 'lowercase_count', 'uppercase_count', 'digit_count', 'special_count',
        'entropy', 'transitions', 'max_repeat', 'leet_count', 'is_common_root',
        'shape_complexity', 'pattern_intensity', 'habit_score', 'char_diversity'
    ]

    return pd.DataFrame([features])[feature_order]

# --- 5. INFERENCE ---
# FIXED from original main.py:
# The original logic forced passwords 10-20 chars -> Medium unconditionally,
# meaning the model was almost never used.
#
# Corrected approach:
#   1. Model predicts probability distribution across all 3 classes
#   2. Apply the 0.41 weak threshold — if P(Weak) >= 0.41, label as Weak
#   3. Otherwise take argmax of probabilities
#   4. Only override for email similarity (highest priority, pre-model check)
#
# This ensures inference behavior is consistent with the evaluation metrics.

def predict_strength(features_df, pwd=""):
    if model is None:
        return 0, "Error (Model Missing)"

    # Pre-model heuristic: letters only + length <= 8 -> force Weak
    # Rationale: pure alphabetic short passwords have no digits or specials,
    # are entirely covered by dictionary and brute-force attacks,
    # and should be flagged regardless of what the model would predict.
    if pwd and all(c.isalpha() for c in pwd) and len(pwd) <= 8:
        return 0, STRENGTH_MAP[0]

    probs = model.predict_proba(features_df)[0]
    # Security-adjusted threshold: err on the side of flagging weak passwords
    if probs[0] >= WEAK_THRESHOLD:
        score_index = 0
    else:
        score_index = int(np.argmax(probs))

    return score_index, STRENGTH_MAP[score_index]

# --- 6. RECOMMENDATION LOGIC ---

def get_recommendations(features_df, email_warning=False):
    recommendations = []

    if email_warning:
        recommendations.append(
            "Do not use your email address or username in your password."
        )

    for rule in SHAP_RULES:
        feature   = rule.get('feature')
        target    = rule.get('target')
        condition = rule.get('condition')
        message   = rule.get('message')

        if feature not in features_df.columns:
            continue

        val = features_df.iloc[0][feature]

        triggered = (
            (condition == "<" and val < target) or
            (condition == ">" and val > target)
        )

        if triggered:
            recommendations.append(message)

    if not recommendations:
        recommendations.append("Increase length and use a wider variety of characters.")

    # Return top 4 unique recommendations sorted by rule priority
    seen = set()
    unique = []
    for r in recommendations:
        if r not in seen:
            seen.add(r)
            unique.append(r)

    return unique[:4]

# --- 7. API ENDPOINTS ---

class PasswordRequest(BaseModel):
    password: str
    email: str | None = None

@app.post("/analyze")
def analyze_password(request: PasswordRequest):
    pwd   = request.password
    email = request.email

    if not pwd:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    try:
        features_df = extract_features(pwd)

        email_warning_triggered = False
        score_index             = 0
        strength_label          = "Weak"

        # Priority override: email similarity check
        # Runs before the model — a password containing the user's email
        # prefix is always Weak regardless of other features
        if email and email.split('@')[0].lower() in pwd.lower():
            score_index             = 0
            strength_label          = "Weak"
            email_warning_triggered = True

        else:
            # Model predicts with security-adjusted threshold
            # pwd passed so letters-only heuristic can be applied pre-model
            score_index, strength_label = predict_strength(features_df, pwd=pwd)

        # Recommendations only for non-Strong passwords
        if strength_label != "Strong":
            recs = get_recommendations(
                features_df, email_warning=email_warning_triggered
            )
        else:
            recs = ["The password is strong. No specific recommendations."]

        return {
            "password_length": len(pwd),
            "strength":        strength_label,
            "score_index":     score_index,
            "recommendations": recs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {
        "status":       "ok",
        "model_loaded": model is not None,
        "rules_loaded": len(SHAP_RULES) > 0,
        "model_version": "v2"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)