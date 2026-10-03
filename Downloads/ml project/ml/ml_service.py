import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GradePath ML Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(current_dir, "gpa_prediction_model.pkl")
model = None

try:
    if os.path.exists(MODEL_PATH):
        # Patch for older versions of sklearn where _RemainderColsList was used
        import sklearn.compose
        try:
            class _RemainderColsList(list):
                pass
            sklearn.compose._column_transformer._RemainderColsList = _RemainderColsList
        except Exception:
            pass
            
        # Patch for SimpleImputer _fill_dtype
        from sklearn.impute import SimpleImputer
        if not hasattr(SimpleImputer, '_fill_dtype'):
            @property
            def _fill_dtype_prop(self):
                return getattr(self, '_fit_dtype', float)
            SimpleImputer._fill_dtype = _fill_dtype_prop
            
        model = joblib.load(MODEL_PATH)
        print(f"Loaded model from {MODEL_PATH}")
    else:
        print(f"WARNING: Model file {MODEL_PATH} not found. Prediction endpoint will fail.")
except Exception as e:
    print(f"Error loading model: {e}")

class PredictionRequest(BaseModel):
    age: float
    gender: str
    quiz1_marks: float
    quiz2_marks: float
    quiz3_marks: float
    total_assignments: float
    midterm_marks: float
    previous_gpa: float
    total_lectures: float
    lectures_attended: float
    total_lab_sessions: float
    labs_attended: float

@app.post("/predict")
def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model unavailable. Please check the Python ML service."
        )
    
    try:
        # Prepare input data as a DataFrame with a single row
        # (This must match the order and names expected by the model)
        data = {
            "age": [request.age],
            "gender": [request.gender],
            "quiz1_marks": [request.quiz1_marks],
            "quiz2_marks": [request.quiz2_marks],
            "quiz3_marks": [request.quiz3_marks],
            "total_assignments": [request.total_assignments],
            "midterm_marks": [request.midterm_marks],
            "previous_gpa": [request.previous_gpa],
            "total_lectures": [request.total_lectures],
            "lectures_attended": [request.lectures_attended],
            "total_lab_sessions": [request.total_lab_sessions],
            "labs_attended": [request.labs_attended]
        }
        df = pd.DataFrame(data)
        
        # Predict using the loaded model
        prediction = model.predict(df)
        
        return {"predicted_final_marks": round(float(prediction[0]), 2)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_service:app", host="0.0.0.0", port=8000, reload=True)
