import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
OPENWEATHER_WEATHER_API_KEY = os.getenv("OPENWEATHER_WEATHER_API_KEY")
OPENWEATHER_GEO_API_KEY = os.getenv("OPENWEATHER_GEO_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Validate required API keys
if not OPENWEATHER_WEATHER_API_KEY:
    raise ValueError("OPENWEATHER_WEATHER_API_KEY environment variable is required")
if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY environment variable is required")

# Model paths
MODEL_PATH = os.getenv("MODEL_PATH", "./model/")
SCALER_PATH = os.path.join(MODEL_PATH, "rice_scaler.pkl")
DATA_PATH = os.getenv("DATA_PATH", "./data/")

# API Settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("PORT", "10000"))  # Render uses PORT env var, default to 10000
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

# Rate limiting
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "100"))

# Timeouts
WEATHER_API_TIMEOUT = int(os.getenv("WEATHER_API_TIMEOUT", "30"))

# Model training
LOOKBACK = int(os.getenv("LOOKBACK", "15"))
