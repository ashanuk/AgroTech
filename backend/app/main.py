from fastapi import FastAPI, UploadFile, File
from app.train import initial_train_model, retrain_model
from app.predict import predict_future_prices

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Rice Forecast API running 🚀"}

@app.post("/train")
def train():
    """Initial training from historical data"""
    initial_train_model()
    return {"status": "Model trained and saved successfully."}

@app.post("/retrain")
def retrain(file: UploadFile = File(...)):
    """Retrain from new data file (CSV)"""
    retrain_model(file)
    return {"status": "Model retrained with new data and saved."}


@app.get("/predict")
def predict():
    forecast_df, history_df = predict_future_prices(n_days=60)
    return {
        "forecast": forecast_df.to_dict(orient="records"),
        "history": history_df.to_dict(orient="records")
    }
