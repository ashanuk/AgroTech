from typing import Optional
from app.crop_recommendation import CropRecommendationSystem
from fastapi import FastAPI, UploadFile, File,Request,HTTPException, Query
from app.train import initial_train_model, retrain_model
from app.predict import predict_future_prices
from langchain_core.messages import AIMessage, HumanMessage
from app.agent import chat_app
from langchain.schema import BaseMessage  # optional import for clarity
from pydantic import BaseModel
from typing import List


app = FastAPI()

# CORS headers middleware
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Handle preflight OPTIONS requests for chat endpoint
@app.options("/chat")
async def chat_preflight():
    return {
        "message": "OK"
    }

@app.options("/chat/clear")
async def chat_clear_preflight():
    return {
        "message": "OK"
    }

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

chat_turns: List[tuple[str, str]] = []

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_input = data.get("message")

    if not user_input:
        return {"error": "No message provided."}

    # Build formatted prompt
    formatted_past = ""
    for user_msg, assistant_msg in chat_turns:
        formatted_past += f"User: {user_msg}\nAssistant: {assistant_msg}\n"

    full_prompt = (
        "You are a helpful assistant.\n"
        + ("Previous conversation:\n" + formatted_past if formatted_past else "")
        + "\nCurrent question:\n"
        + f"User: {user_input}"
    )

    # Call the agent using formatted message
    result = chat_app.invoke({
        "messages": [{"role": "user", "content": full_prompt}]
    })
    print(f"Result: {result['messages']}")
    
    # Extract the final AI response (get the last meaningful AI message)
    ai_response = ""
    
    # Get all AI messages and find the last one with meaningful content
    ai_messages = [m for m in result["messages"] if m.type == "ai" and m.content.strip()]
    
    if ai_messages:
        # Get the last AI message with content
        last_message = ai_messages[-1]
        ai_response = last_message.content
        
        # If the last message is from supervisor and has good content, use it
        # Otherwise, look for the best response from any expert
        if not ai_response or len(ai_response.strip()) < 10:
            # Look for the most substantial response from any AI agent
            for msg in reversed(ai_messages):
                if msg.content.strip() and len(msg.content.strip()) > 20:
                    ai_response = msg.content
                    break
    
    # Fallback if no good response found
    if not ai_response:
        ai_response = "I apologize, but I couldn't generate a proper response. Please try rephrasing your question."

    # Save to chat history
    chat_turns.append((user_input, ai_response))

    return {"reply": ai_response}

@app.delete("/chat/clear")
async def clear_chat():
    """
    Clear the chat history
    
    Removes all stored conversation history from the server.
    This will reset the chat context for future conversations.
    """
    global chat_turns
    chat_turns = []
    
    return {
        "success": True,
        "message": "Chat history cleared successfully",
        "chat_turns_count": len(chat_turns)
    }

@app.get("/chat/history")
async def get_chat_history():
    """
    Get the current chat history
    
    Returns the conversation history stored on the server.
    """
    return {
        "success": True,
        "chat_turns": chat_turns,
        "total_conversations": len(chat_turns)
    }

