from fastapi import FastAPI, UploadFile, File,Request
from app.train import initial_train_model, retrain_model
from app.predict import predict_future_prices
from langchain_core.messages import AIMessage, HumanMessage
from app.agent import chat_app
from langchain.schema import BaseMessage  # optional import for clarity
from pydantic import BaseModel
from typing import List

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
    # Extract the latest AI response
    ai_response = ""
    for m in result["messages"]:
        if m.type == "ai" and m.content.strip():
            ai_response = m.content
            break

    # Save to chat history
    chat_turns.append((user_input, ai_response))

    return {"reply": ai_response}