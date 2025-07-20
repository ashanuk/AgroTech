import numpy as np
import joblib
from app.config import MODEL_PATH, SCALER_PATH, OPENWEATHER_WEATHER_API_KEY, TAVILY_API_KEY, OPENWEATHER_GEO_API_KEY
import requests
from app.crop_recommendation import CropRecommendationSystem
crop_system = CropRecommendationSystem()

def create_sequences(values, lookback=15):
    X, y = [], []
    for i in range(len(values) - lookback):
        X.append(values[i:i + lookback])
        y.append(values[i + lookback])
    return np.array(X), np.array(y)

def save_model_artifacts(model, scaler):
    model.save(MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)


from langchain_community.tools import DuckDuckGoSearchRun
from tavily import TavilyClient

def add(a, b):
    """
    Add two numbers.

    Args:
        a (int or float): First number.
        b (int or float): Second number.

    Returns:
        int or float: The sum of a and b.
    """
    return a + b

def multiply(a, b):
    """
    Multiply two numbers.

    Args:
        a (int or float): First number.
        b (int or float): Second number.

    Returns:
        int or float: The product of a and b.
    """
    return a * b

def search_ddgo(query):
    """
    Perform a web search using Tavily AI.

    Args:
        query (str): The search query string.

    Returns:
        str: Search results from Tavily AI.
    """
    try:
        if not TAVILY_API_KEY:
            raise ValueError("TAVILY_API_KEY not configured")
        
        tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
        response = tavily_client.search(query)
        return str(response)
    except Exception as e:
        # Fallback to DuckDuckGo if Tavily fails
        search = DuckDuckGoSearchRun()
        return search.invoke(query)

# Example usage
# print(search_ddgo("what is quantum computing"))

import requests

def get_weather(place, api_key=None):
    """
    Retrieve current weather information for a given location using the OpenWeatherMap API.

    Parameters:
        place (str): Name of the city or location (e.g., "London", "Colombo").
        api_key (str, optional): OpenWeatherMap API key. Uses environment variable if not provided.

    Returns:
        str: A formatted string with current weather details including description,
             temperature, feels-like temperature, humidity, and wind speed.
             If an error occurs, a message indicating the issue is returned.
             
    Example:
        >>> get_weather("New York")
        "Weather in New York:\n  Description: clear sky\n  Temperature: 27°C\n  Feels like: 29°C\n  Humidity: 60%\n  Wind Speed: 4.6 m/s"
    """
    # Use provided API key or fall back to environment variable
    api_key = api_key or OPENWEATHER_WEATHER_API_KEY
    
    if not api_key:
        return "Error: OpenWeatherMap API key not configured"
    
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": place,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        weather = data['weather'][0]['description']
        temp = data['main']['temp']
        feels_like = data['main']['feels_like']
        humidity = data['main']['humidity']
        wind_speed = data['wind']['speed']
        return f"Weather in {place}:\n" \
               f"  Description: {weather}\n" \
               f"  Temperature: {temp}°C\n" \
               f"  Feels like: {feels_like}°C\n" \
               f"  Humidity: {humidity}%\n" \
               f"  Wind Speed: {wind_speed} m/s"
    else:
        return f"Error: Couldn't retrieve weather for '{place}'. Status code: {response.status_code}"

  # Replace with your actual OpenWeatherMap API key
# print(get_weather("colombo"))
import requests
from datetime import datetime, timedelta

# Use environment variable instead of hardcoded API key
API_KEY = OPENWEATHER_GEO_API_KEY

def get_lat_lon(city):
    """Convert city name to latitude and longitude"""
    if not API_KEY:
        raise Exception("OpenWeatherMap API key not configured")
        
    geo_url = "http://api.openweathermap.org/geo/1.0/direct"
    
    # Try different query formats
    queries = [
        f'{city},LK',           # With country code
        f'{city},Sri Lanka',    # With full country name
        f'{city}',              # Without country
    ]
    
    for query in queries:
        params = {
            'q': query,
            'limit': 5,
            'appid': API_KEY
        }
        response = requests.get(geo_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"Found: {data[0]['name']}, {data[0].get('state', '')}, {data[0]['country']}")
                return data[0]['lat'], data[0]['lon']
    
    raise Exception(f"City '{city}' not found. Try cities like: Colombo, Ratnapura, Kandy, Galle")

def predict_weather_for_date(city, target_date):
    """
        
    Get a weather summary for a specific future date (up to 5 days ahead) using the 
    OpenWeatherMap One Call Day Summary API (requires paid subscription).

    Parameters:
        city (str): Name of the city (must be in Sri Lanka for this use case).
        date_str (str): Target date in 'YYYY-MM-DD' format.

    Returns:
        str: A formatted weather summary or an error message.
    
    """
    try:
        # Convert city to coordinates
        lat, lon = get_lat_lon(city)
        print(f"Coordinates: {lat}, {lon}")
        
        # Parse the target date
        date_obj = datetime.strptime(target_date, '%Y-%m-%d')
        today = datetime.now()
        days_diff = (date_obj - today).days
        
        print(f"Target date: {target_date} ({days_diff} days from today)")
        if days_diff==-1 or days_diff==0 :
                return  get_weather(city)      
        elif days_diff < -1:
            
            print("Note: This is a past date. Using historical data approach...")
            return get_day_summary_paid_api(lat, lon, target_date)
       
        elif days_diff <= 5:
            print("Using 5-day forecast (Free API)...")
            return get_forecast_for_specific_date(lat, lon, target_date)
        else:
            print("Error: Free API only supports up to 5 days in the future.")
            print("For longer forecasts, you need a paid subscription.")
            
    except ValueError:
        print("Invalid date format. Please use YYYY-MM-DD format (e.g., 2025-07-10)")
    except Exception as e:
        print(f"Error: {e}")

def get_forecast_for_specific_date(lat, lon, target_date):
    """
    Get weather forecast summary for a specific date within the next 5 days using the free OpenWeatherMap 3-hour forecast API.

    Parameters:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.
        target_date (str): Date in 'YYYY-MM-DD' format (within 5 days from current date).

    Returns:
        str: A formatted weather forecast summary or an error message.
    """
    weather_url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        'lat': lat,
        'lon': lon,
        'units': 'metric',
        'appid': API_KEY
    }

    try:
        response = requests.get(weather_url, params=params)
        if response.status_code == 200:
            data = response.json()

            # Collect forecasts matching the target date
            target_forecasts = [
                item for item in data['list']
                if datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d') == target_date
            ]

            if not target_forecasts:
                return f"No forecast data available for {target_date}."

            # Summary calculations
            temps = [f['main']['temp'] for f in target_forecasts]
            humidity_vals = [f['main']['humidity'] for f in target_forecasts]
            descriptions = {f['weather'][0]['description'] for f in target_forecasts}

            summary = (
                f"Weather Forecast for {target_date}:\n"
                f"{'=' * 50}\n"
                f"Temperature Range: {min(temps):.1f}°C - {max(temps):.1f}°C\n"
                f"Average Humidity: {sum(humidity_vals) / len(humidity_vals):.0f}%\n"
                f"Weather Conditions: {', '.join(descriptions)}\n\n"
                f"Hourly Breakdown:\n"
            )

            for forecast in target_forecasts:
                time = datetime.fromtimestamp(forecast['dt']).strftime('%H:%M')
                temp = forecast['main']['temp']
                desc = forecast['weather'][0]['description']
                summary += f"  {time}: {temp:.1f}°C, {desc}\n"

            return summary
        else:
            return f"Error fetching forecast: {response.status_code} - {response.text}"

    except Exception as e:
        return f"An error occurred: {str(e)}"





def get_day_summary_paid_api(lat, lon, date_str):
    """
    Get weather summary using the paid One Call Day Summary API (OpenWeatherMap).
    
    Parameters:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.
        date_str (str): Target date in 'YYYY-MM-DD' format.
    
    Returns:
        str: Formatted weather summary or error message.
    """
    weather_url = "https://api.openweathermap.org/data/3.0/onecall/day_summary"
    params = {
        'lat': lat,
        'lon': lon,
        'date': date_str,
        'units': 'metric',
        'appid': API_KEY
    }
    
    response = requests.get(weather_url, params=params)
    if response.status_code == 200:
        data = response.json()
        summary = (
            f"Weather Summary for {date_str}:\n"
            f"Temperature - Max: {data['temperature']['max']}°C, Min: {data['temperature']['min']}°C\n"
            f"Feels Like - Max: {data['temperature']['feels_like_max']}°C, Min: {data['temperature']['feels_like_min']}°C\n"
            f"Humidity (Afternoon): {data['humidity']['afternoon']}%\n"
            f"Pressure (Afternoon): {data['pressure']['afternoon']} hPa\n"
        )
        if 'precipitation' in data and data['precipitation']['total'] > 0:
            summary += f"Precipitation: {data['precipitation']['total']} mm\n"
        return summary
    else:
        if response.status_code == 401:
            return "Error: Unauthorized. This API requires a paid OpenWeatherMap subscription."
        return f"Error {response.status_code}: {response.text}"



def get_suitable_crops_only(location: str, use_defaults: bool = True):
    """
    Get suitable crops with probabilities for a location (returns crops with >70% probability)
    
    Input:
        - location (str): City/area name (e.g., "Mumbai, India")
        - use_defaults (bool): Whether to use default parameters or not
    
    Output:
        - List of crops with probabilities [{"crop": "rice", "probability": 0.85}, ...] or []

    Raises:
        - ValueError: If crop recommendation fails or an unexpected error occurs
    """
    try:
        result = crop_system.get_crop_recommendations(
            location=location,
            use_defaults=use_defaults
        )

        if not result['success']:
            raise ValueError(f"Crop recommendation failed: {result['error']}")

        suitable_crops = [
            {'crop': rec['crop']}
            for rec in result['recommendations']
            if rec.get('suitability') == 'suitable'
        ]

        return suitable_crops

    except Exception as e:
        raise ValueError(f"Error getting suitable crops: {str(e)}")




