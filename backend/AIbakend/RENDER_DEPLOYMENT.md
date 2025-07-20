# Render.com Deployment Configuration

## Environment Variables to Set in Render Dashboard:

### Required API Keys
- `OPENWEATHER_WEATHER_API_KEY`: Your OpenWeatherMap API key
- `OPENWEATHER_GEO_API_KEY`: Your OpenWeatherMap Geocoding API key  
- `TAVILY_API_KEY`: Your Tavily search API key
- `GEMINIAPI`: Your Google Gemini API key

### Security
- `SECRET_KEY`: A secure random string (minimum 32 characters)

### CORS Configuration
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://yourfrontend.vercel.app,https://yourdomain.com`)

### Optional Configuration
- `DEBUG`: Set to `true` for development, `false` for production (default: false)
- `MAX_REQUESTS_PER_MINUTE`: Rate limit (default: 100)
- `WEATHER_API_TIMEOUT`: API timeout in seconds (default: 30)

## Render Service Configuration:

### Web Service Settings:
- **Environment**: Python 3
- **Build Command**: `./build.sh`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- **Port**: 10000
- **Health Check Path**: `/` (returns API status)

### Important Notes:
1. Make sure to upload your model files to the repository or configure external storage
2. Set all required environment variables in Render dashboard
3. Configure CORS origins to include your frontend domain
4. The service will auto-deploy on git pushes to main branch

### Model Files Required:
- `model/rice_model.h5`
- `model/rice_scaler.pkl` 
- `model/cropOnWeather.pkl`

If these files are too large for git, consider using:
- Git LFS (Large File Storage)
- External storage (AWS S3, Google Cloud Storage) with download during build
- Render persistent disks for model storage
