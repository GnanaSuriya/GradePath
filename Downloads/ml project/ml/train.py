import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ==========================================
# 1. DATASET INSPECTION
# ==========================================
print("=== 1. DATASET INSPECTION ===\n")

current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(current_dir, "data", "student_dropout_behavior_dataset.csv")

if not os.path.exists(file_path):
    print(f"Error: Dataset not found at {file_path}")
    print("Please place the dataset at this location before running the script.")
    exit(1)

df = pd.read_csv(file_path)

print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
print("\nColumns in Dataset:")
print(df.columns.tolist())

print("\nFirst 5 Rows:")
display(df.head())

print("\nData Types:")
print(df.dtypes)

print("\nMissing Values count:")
print(df.isnull().sum())

print("\nDuplicate Rows count:")
print(df.duplicated().sum())

# Verify that assignments_submitted is 100% null and drop it
is_all_null = df['assignments_submitted'].isnull().all()
print(f"\nIs 'assignments_submitted' 100% null? {is_all_null}")
if is_all_null:
    print("Dropping 'assignments_submitted' column because it contains no usable information.")
    df = df.drop(columns=['assignments_submitted'])

# We will also drop identifier columns during feature selection to avoid meaningless patterns

# ==========================================
# 2. TARGET SELECTION
# ==========================================
print("\n=== 2. TARGET SELECTION ===\n")
target_col = 'final_marks'
print(f"TARGET = {target_col}")
print("Note: Conceptually, we define this task as 'Academic Performance Prediction'.")
print("Warning: We do NOT call 'final_marks' GPA or CGPA. GPA/CGPA calculations are handled separately using mathematical formulas.\n")

# ==========================================
# 3. CHECK FOR DATA LEAKAGE
# ==========================================
print("=== 3. CHECK FOR DATA LEAKAGE ===\n")
# Candidate features list
candidate_features = [
    'age', 'gender', 'quiz1_marks', 'quiz2_marks', 'quiz3_marks',
    'total_assignments', 'midterm_marks', 'previous_gpa',
    'total_lectures', 'lectures_attended', 'total_lab_sessions', 'labs_attended'
]

# Inspect and verify candidate features
print("Verifying that none of the chosen features are derived directly from the target variable 'final_marks':")
leakage_detected = False
for feat in candidate_features:
    if feat not in df.columns:
        print(f"Warning: Feature '{feat}' is not present in the dataset.")
    else:
        corr_val = df[feat].corr(df[target_col]) if df[feat].dtype in [np.float64, np.int64] else 0
        print(f"- Feature '{feat}': present (Correlation with final_marks: {corr_val:.4f})")
        if abs(corr_val) > 0.98:
            print(f"  -> DANGER: Feature '{feat}' might cause data leakage!")
            leakage_detected = True

if not leakage_detected:
    print("Result: No direct leakage detected. Candidate features are safe to use for predictions.\n")

# Define X and y
X = df[candidate_features]
y = df[target_col]

# ==========================================
# 4. PREPROCESSING PIPELINE
# ==========================================
print("=== 4. PREPROCESSING ===\n")
num_features = X.select_dtypes(include=[np.number]).columns.tolist()
cat_features = X.select_dtypes(include=[object, 'category']).columns.tolist()

print(f"Numerical Features to Preprocess: {num_features}")
print(f"Categorical Features to Preprocess: {cat_features}")

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, num_features),
        ('cat', categorical_transformer, cat_features)
    ])

# ==========================================
# 5. TRAIN/TEST SPLIT
# ==========================================
print("\n=== 5. TRAIN/TEST SPLIT ===\n")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"Training set size: {X_train.shape[0]} samples")
print(f"Testing set size: {X_test.shape[0]} samples\n")

# ==========================================
# 6. & 7. MODELS & EVALUATION WITH BASELINE
# ==========================================
print("=== 6. & 7. MODELS & EVALUATION ===\n")

# Add the baseline DummyRegressor
models = {
    "Dummy Regressor (Mean Baseline)": DummyRegressor(strategy="mean"),
    "Linear Regression": LinearRegression(),
    "Decision Tree Regressor": DecisionTreeRegressor(random_state=42, max_depth=5),
    "Random Forest Regressor": RandomForestRegressor(random_state=42, n_estimators=100, max_depth=6),
    "Gradient Boosting Regressor": GradientBoostingRegressor(random_state=42, n_estimators=100)
}

trained_pipelines = {}
eval_results = []
kf = KFold(n_splits=5, shuffle=True, random_state=42)

for name, model in models.items():
    pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', model)])
    pipeline.fit(X_train, y_train)
    trained_pipelines[name] = pipeline

    # Test metrics
    preds = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, preds)

    # Cross-validation
    cv_scores = cross_val_score(pipeline, X, y, cv=kf, scoring='r2')

    eval_results.append({
        "Model": name,
        "Test MAE": round(mae, 4),
        "Test RMSE": round(rmse, 4),
        "Test R2": round(r2, 4),
        "Mean CV R2": round(cv_scores.mean(), 4),
        "CV Std": round(cv_scores.std(), 4)
    })

df_eval = pd.DataFrame(eval_results).sort_values(by="Test MAE", ascending=True)
display(df_eval)

# ==========================================
# 8. & 10. HONEST MODEL INTERPRETATION & SELECTION
# ==========================================
print("\n=== 8. & 10. HONEST MODEL INTERPRETATION ===\n")
best_row = df_eval.iloc[0]
worst_row = df_eval.iloc[-1]
print(f"Technically, the lowest Test MAE model is: '{best_row['Model']}' with MAE={best_row['Test MAE']}.")
print(f"However, note that the Mean CV R2 score for {best_row['Model']} is: {best_row['Mean CV R2']}.")

if best_row['Test R2'] <= 0 or best_row['Mean CV R2'] <= 0:
    print("\n!!! HONEST DISCLOSURE: THE DATASET HAS WEAK PREDICTIVE POWER !!!")
    print("- All tested ML models score a negative or near-zero R2.")
    print("- They do NOT meaningfully outperform a simple average prediction (Dummy Regressor Mean Baseline).")
    print("- Because the dataset contains only 300 rows and high noise, it is mathematically insufficient for a reliable predictive model.")
    print("- Please treat these ML model predictions with extreme caution; they should NOT be labeled as highly accurate or used as a critical grading reference in production.")
else:
    print("- The model outperforms the simple baseline.")

# Define the final selected pipeline
final_model_name = best_row['Model']
final_pipeline = trained_pipelines[final_model_name]
print(f"\nFINAL MODEL PIPELINE = {final_model_name}")

# ==========================================
# 12. FEATURE IMPORTANCE
# ==========================================
print("\n=== 12. FEATURE IMPORTANCE / COEFFICIENTS ===\n")
reg_model = final_pipeline.named_steps['regressor']
ohe_feature_names = final_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(cat_features) if cat_features else []
transformed_feature_names = num_features + list(ohe_feature_names)

if hasattr(reg_model, 'feature_importances_'):
    importances = reg_model.feature_importances_
    importances_df = pd.DataFrame({'Feature': transformed_feature_names, 'Importance': importances}).sort_values(by='Importance', ascending=False)
    display(importances_df)
    print("\nNote: Feature importance shows association/usefulness within this model. It does NOT prove or imply causation.")
elif hasattr(reg_model, 'coef_'):
    coefficients = reg_model.coef_
    coef_df = pd.DataFrame({'Feature': transformed_feature_names, 'Coefficient': coefficients}).sort_values(by='Coefficient', key=abs, ascending=False)
    display(coef_df)
    print("\nNote: Feature coefficients show correlation strengths within this linear model. They do NOT imply causal influence.")

# ==========================================
# 13. SAMPLE PREDICTION
# ==========================================
print("\n=== 13. SAMPLE PREDICTION ===\n")
sample_student = {col: [X[col].median() if col in num_features else X[col].mode()[0]] for col in X.columns}
sample_df = pd.DataFrame(sample_student)

print("Input sample features:")
for col, val in sample_student.items():
    print(f"  - {col}: {val[0]}")

predicted_marks = final_pipeline.predict(sample_df)[0]
print(f"\nPredicted final marks: {predicted_marks:.2f} (out of 50.0)")

# ==========================================
# 14. SAVE THE MODEL AND METADATA
# ==========================================
print("\n=== 14. SAVE THE MODEL ===\n")
model_path = os.path.join(current_dir, 'gpa_prediction_model.pkl')
joblib.dump(final_pipeline, model_path)
print(f"Successfully saved '{model_path}'")

metadata = {
    "project": "GPA Tracker & Academic Performance Prediction System",
    "task": "Academic Performance Prediction",
    "target": target_col,
    "model_type": final_model_name,
    "features": candidate_features,
    "test_mae": float(best_row['Test MAE']),
    "test_rmse": float(best_row['Test RMSE']),
    "test_r2": float(best_row['Test R2']),
    "cv_mean_r2": float(best_row['Mean CV R2']),
    "cv_std_r2": float(best_row['CV Std']),
    "dataset_rows": df.shape[0]
}

metadata_path = os.path.join(current_dir, 'model_metadata.json')
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=4)
print(f"Successfully saved '{metadata_path}'")

# ==========================================
# 15. CREATE A MODEL TEST SCRIPT
# ==========================================
print("\n=== 15. CREATE A MODEL TEST SCRIPT ===\n")
loaded_pipeline = joblib.load(model_path)
loaded_prediction = loaded_pipeline.predict(sample_df)[0]
print("Saved model loaded successfully.")
print(f"Prediction from saved model: {loaded_prediction:.2f}")

# ==========================================
# 16. & 17. GPA & CGPA MATHEMATICAL ENGINE
# ==========================================
print("\n=== 16. & 17. GPA & CGPA MATHEMATICAL ENGINE ===\n")

def calculate_semester_gpa(credits, grade_points):
    if sum(credits) == 0:
        return 0.0
    total_weighted_points = sum(c * g for c, g in zip(credits, grade_points))
    return total_weighted_points / sum(credits)

def calculate_cgpa(semester_credits, semester_gpas):
    if sum(semester_credits) == 0:
        return 0.0
    total_points = sum(sc * gpa for sc, gpa in zip(semester_credits, semester_gpas))
    return total_points / sum(semester_credits)

def calculate_projected_final_cgpa(current_cgpa, completed_credits, remaining_credits, expected_gpa):
    total_credits = completed_credits + remaining_credits
    if total_credits == 0:
        return 0.0
    return ((current_cgpa * completed_credits) + (expected_gpa * remaining_credits)) / total_credits

def calculate_max_possible_cgpa(current_cgpa, completed_credits, remaining_credits):
    return calculate_projected_final_cgpa(current_cgpa, completed_credits, remaining_credits, 10.0)

def calculate_required_future_gpa(current_cgpa, completed_credits, remaining_credits, target_cgpa):
    total_credits = completed_credits + remaining_credits
    if remaining_credits == 0:
        return "Error: No remaining credits left to change CGPA."
    required_points = (target_cgpa * total_credits) - (current_cgpa * completed_credits)
    required_gpa = required_points / remaining_credits
    if required_gpa > 10.0:
         return "Target is mathematically unreachable."
    return max(0.0, required_gpa)

def generate_gpa_scenarios(current_cgpa, completed_credits, remaining_credits):
    scenarios = [8.0, 8.5, 9.0, 9.5, 10.0]
    print("Future Expected GPA | Projected Final CGPA")
    print("------------------------------------------")
    for gpa in scenarios:
        projected = calculate_projected_cgpa(current_cgpa, completed_credits, remaining_credits, gpa)
        print(f"      {gpa:.1f}           |        {projected:.2f}")

# ==========================================
# 18. EXAMPLE WITH VIT-STYLE 10-POINT SCALE
# ==========================================
print("\n=== 18. DEMONSTRATION WITH 10-POINT SCALE (VIT style) ===\n")
example_cgpa = 8.39
completed_creds = 46
remaining_creds = 154

print("[Demonstration only — replace with actual student credit values]")
print(f"Current CGPA: {example_cgpa}")
print(f"Completed Credits: {completed_creds}")
print(f"Remaining Credits: {remaining_creds}")
print(f"Max Possible CGPA: {calculate_max_possible_cgpa(example_cgpa, completed_creds, remaining_creds):.2f}")
print(f"Required average GPA to reach target 8.5: {calculate_required_future_gpa(example_cgpa, completed_creds, remaining_creds, 8.5)}")
print(f"Required average GPA to reach target 9.0: {calculate_required_future_gpa(example_cgpa, completed_creds, remaining_creds, 9.0)}")
print(f"Required average GPA to reach target 9.5: {calculate_required_future_gpa(example_cgpa, completed_creds, remaining_creds, 9.5)}")

print("\nScenario Table:")
generate_gpa_scenarios(example_cgpa, completed_creds, remaining_creds)

# ==========================================
# 19. IMPORTANT SCALE WARNING
# ==========================================
print("\n=== 19. IMPORTANT SCALE WARNING ===\n")
print("WARNING: The ML dataset previous_gpa features use a standard 4-point scale.")
print("The GPA calculator scenario engine on this page is built for a 10-point scale (e.g., VIT style).")
print("DO NOT directly mix the Kaggle GPA data/predictions with the 10-point calculators.")

# ==========================================
# 20. FASTAPI PREPARATION
0# ==========================================
print("\n=== 20. FASTAPI PREPARATION ===\n")
print("POST /predict")
print("Request Body (JSON):")
print(json.dumps({col: float(X[col].median()) if col in num_features else str(X[col].mode()[0]) for col in X.columns}, indent=4))
print("\nResponse (JSON):")
print(json.dumps({"predicted_final_marks": round(float(loaded_prediction), 2)}, indent=4))

# ==========================================
# 21. WEB APP ARCHITECTURE
# ==========================================
print("\n=== 21. WEB APP ARCHITECTURE ===\n")
print("""
ML Prediction Pipeline:
React + Vite -> FastAPI (POST /predict) -> loaded gpa_prediction_model.pkl -> predicted_final_marks

Mathematical Projection Engine (Separate):
React + Vite -> Local State Calculator Engine -> Displays Semester GPA / Target GPAs / Future Scenarios
""")

# ==========================================
# 22. FINAL NOTEBOOK OUTPUT
# ==========================================
print("========================================")
print("PROJECT PIPELINE COMPLETE")
print("=========================")
print(f"Dataset: {file_path}")
print(f"Target: {target_col}")
print(f"Number of records: {df.shape[0]}")
print(f"Number of usable features: {len(candidate_features)}")
print("\nModels evaluated:")
for res in eval_results:
    print(f"* {res['Model']}")
print(f"\nSelected model: {final_model_name}")
print(f"Test MAE: {best_row['Test MAE']}")
print(f"Test RMSE: {best_row['Test RMSE']}")
print(f"Test R2: {best_row['Test R2']}")
print(f"CV Mean R2: {best_row['Mean CV R2']}")
print(f"CV Std: {best_row['CV Std']}")
print("\nSaved files:")
print("- gpa_prediction_model.pkl")
print("- model_metadata.json")
print("\nML limitation:")
if best_row['Test R2'] <= 0:
    print("The predictive power is extremely weak. The trained models perform comparably to a mean baseline dummy repressor.")
else:
    print("Model provides a marginal baseline predictive advantage over dummy regressor.")
print("\nGPA engine:")
print("* Semester GPA calculator\n* CGPA calculator\n* Maximum CGPA calculator\n* Required GPA calculator\n* Future CGPA scenario calculator")
print("\nAPI ready: YES")
print("========================================")
