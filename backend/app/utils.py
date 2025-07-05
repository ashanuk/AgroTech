import numpy as np
import joblib
from app.config import MODEL_PATH, SCALER_PATH

def create_sequences(values, lookback=15):
    X, y = [], []
    for i in range(len(values) - lookback):
        X.append(values[i:i + lookback])
        y.append(values[i + lookback])
    return np.array(X), np.array(y)

def save_model_artifacts(model, scaler):
    model.save(MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
