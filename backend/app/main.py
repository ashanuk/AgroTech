from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.train import initial_train_model, retrain_model
from app.predict import predict_future_prices
from app.crop_recommendation import CropRecommendationSystem

app = FastAPI()

# Initialize crop recommendation system
crop_system = CropRecommendationSystem()

# Pydantic models for request/response
class CropRecommendationRequest(BaseModel):
    location: str
    use_defaults: Optional[bool] = False

class ManualCropRequest(BaseModel):
    nitrogen: float
    temperature: float
    ph: float
    rainfall: float
    humidity: float

@app.get("/")
def root():
    return {"message": "AgroTech API - Rice Forecast & Crop Recommendation 🚀"}

# Existing rice forecasting endpoints
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

# New crop recommendation endpoints
@app.post("/crop-recommendation")
def get_crop_recommendation(request: CropRecommendationRequest):
    """
    Get crop recommendations based on location data
    
    Fetches soil, weather, and rainfall data automatically and provides 
    crop recommendations based on current environmental conditions.
    """
    try:
        result = crop_system.get_crop_recommendations(
            location=request.location,
            use_defaults=request.use_defaults
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting crop recommendations: {str(e)}")

@app.post("/crop-recommendation/manual")
def get_manual_crop_recommendation(request: ManualCropRequest):
    """
    Get crop recommendations based on manually provided environmental data
    
    Uses the ML model to provide crop recommendations based on the 5 input features:
    N, temperature, humidity, pH, and rainfall.
    """
    try:
        # Prepare model input
        model_input = {
            'N': request.nitrogen,
            'temperature': request.temperature,
            'ph': request.ph,
            'rainfall': request.rainfall,
            'humidity': request.humidity
        }
        
        # Get recommendations from ML model
        recommendations = crop_system._predict_crops(model_input)
        
        return {
            'success': True,
            'input_data': {
                'nitrogen': request.nitrogen,
                'temperature': request.temperature,
                'ph': request.ph,
                'rainfall': request.rainfall,
                'humidity': request.humidity
            },
            'recommendations': recommendations,
            'model_used': 'LightGBM Classifier',
            'total_crops': len(crop_system.crop_labels)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting manual crop recommendations: {str(e)}")

@app.get("/crop-recommendation/details/{crop_name}")
def get_crop_details(crop_name: str):
    """Get detailed information about a specific crop"""
    try:
        details = crop_system.get_crop_details(crop_name)
        return {
            'success': True,
            'crop': crop_name,
            'details': details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting crop details: {str(e)}")

@app.get("/crop-recommendation/test")
def test_crop_system():
    """Test the crop recommendation system with sample data"""
    try:
        # Test with Matale, Sri Lanka as default
        result = crop_system.get_crop_recommendations("Matale, Sri Lanka", use_defaults=True)
        return {
            'success': True,
            'message': 'Crop recommendation system test',
            'model_available': crop_system.model is not None,
            'test_result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'model_available': crop_system.model is not None
        }

@app.post("/crop-recommendation/suitable-crops")
def get_suitable_crops_only(request: CropRecommendationRequest):
    """
    Get suitable crops with probabilities for a location (returns crops with >70% probability)
    
    Input: City/area name (e.g., "Mumbai, India", "Delhi, India")
    Output: List of crops with probabilities [{"crop": "rice", "probability": 0.85}, ...] or []
    
    Example usage:
    - POST /crop-recommendation/suitable-crops
    - Body: {"location": "Mumbai, India", "use_defaults": true}
    - Returns: [{"crop": "rice", "probability": 0.85}]
    """
    try:
        result = crop_system.get_crop_recommendations(
            location=request.location,
            use_defaults=request.use_defaults
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Extract suitable crops with their probabilities (>70% probability)
        suitable_crops = [
            {'crop': rec['crop'], 'probability': rec['confidence']}
            for rec in result['recommendations'] 
            if rec.get('suitability') == 'suitable'
        ]
        
        # Return crop names with probabilities
        return suitable_crops
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suitable crops: {str(e)}")

@app.post("/crop-recommendation/suitable-crops/manual")
def get_suitable_crops_manual(request: ManualCropRequest):
    """
    Get suitable crops with probabilities using manual environmental data (returns crops with >70% probability)
    
    Input: Environmental parameters (nitrogen, temperature, humidity, ph, rainfall)
    Output: List of crops with probabilities [{"crop": "rice", "probability": 0.85}, ...] or []
    
    Example usage:
    - POST /crop-recommendation/suitable-crops/manual
    - Body: {"nitrogen": 90, "temperature": 23.75, "humidity": 82.32, "ph": 6.5, "rainfall": 200.98}
    - Returns: [{"crop": "rice", "probability": 0.85}]
    """
    try:
        # Prepare model input
        model_input = {
            'N': request.nitrogen,
            'temperature': request.temperature,
            'ph': request.ph,
            'rainfall': request.rainfall,
            'humidity': request.humidity
        }
        
        # Get recommendations from ML model
        recommendations = crop_system._predict_crops(model_input)
        
        # Extract suitable crops with their probabilities (>70% probability)
        suitable_crops = [
            {'crop': rec['crop'], 'probability': rec['confidence']}
            for rec in recommendations 
            if rec.get('suitability') == 'suitable'
        ]
        
        # Return crop names with probabilities
        return suitable_crops
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suitable crops: {str(e)}")
