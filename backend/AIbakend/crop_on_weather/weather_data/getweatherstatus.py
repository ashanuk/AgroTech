import requests
from datetime import datetime, timedelta

API_KEY = '18fd856d30b48d870d2d9c7f709e6227'

def get_lat_lon(city):
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
            'limit': 5,  # Get more results to choose from
            'appid': API_KEY
        }
        response = requests.get(geo_url, params=params)
        print(f"Trying query: {query}")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} results")
            
            if data:  # Check if the list is not empty
                # Print all found locations
                for i, location in enumerate(data):
                    print(f"{i+1}. {location['name']}, {location.get('state', '')}, {location['country']} - Lat: {location['lat']}, Lon: {location['lon']}")
                
                # Return the first result
                return data[0]['lat'], data[0]['lon']
    
    raise Exception("City not found in any query format.")

def get_weather_forecast(lat, lon):
    # Using the current weather API instead of One Call API (which requires subscription)
    weather_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        'lat': lat,
        'lon': lon,
        'units': 'metric',
        'appid': API_KEY
    }
    response = requests.get(weather_url, params=params)
    if response.status_code == 200:
        
        data = response.json()
        print(data)
        print("Current Weather:\n")
        temp = data['main']['temp']
        feels_like = data['main']['feels_like']
        humidity = data['main']['humidity']
        desc = data['weather'][0]['description']
        city = data['name']
        print(f"City: {city}")
        print(f"Temperature: {temp}°C (feels like {feels_like}°C)")
        print(f"Humidity: {humidity}%")
        print(f"Description: {desc}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def get_day_summary(lat, lon, date_str):
    """
    Get weather summary for a specific day using One Call Day Summary API (3.0)
    Note: This requires a paid subscription and works for historical/current dates
    """
    weather_url = "https://api.openweathermap.org/data/3.0/onecall/day_summary"
    params = {
        'lat': lat,
        'lon': lon,
        'date': date_str,  # Format: YYYY-MM-DD
        'units': 'metric',
        'appid': API_KEY
    }
    response = requests.get(weather_url, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"Weather Summary for {date_str}:\n")
        print(f"Date: {data['date']}")
        print(f"Temperature - Max: {data['temperature']['max']}°C, Min: {data['temperature']['min']}°C")
        print(f"Feels Like - Max: {data['temperature']['feels_like_max']}°C, Min: {data['temperature']['feels_like_min']}°C")
        print(f"Humidity: {data['humidity']['afternoon']}%")
        print(f"Pressure: {data['pressure']['afternoon']} hPa")
        if 'precipitation' in data:
            print(f"Precipitation: {data['precipitation']['total']} mm")
    else:
        print(f"Error: {response.status_code} - {response.text}")
        if response.status_code == 401:
            print("Note: This API requires a paid subscription to OpenWeatherMap")

def get_5day_forecast(lat, lon):
    """
    Get 5-day weather forecast using the free 2.5 API
    """
    weather_url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        'lat': lat,
        'lon': lon,
        'units': 'metric',
        'appid': API_KEY
    }
    response = requests.get(weather_url, params=params)
    if response.status_code == 200:
        data = response.json()
        print("5-Day Weather Forecast:\n")
        
        # Group forecasts by date
        daily_forecasts = {}
        for item in data['list']:
            date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            if date not in daily_forecasts:
                daily_forecasts[date] = []
            daily_forecasts[date].append(item)
        
        # Display daily summaries
        for date, forecasts in list(daily_forecasts.items())[:5]:  # Show 5 days
            temps = [f['main']['temp'] for f in forecasts]
            descriptions = [f['weather'][0]['description'] for f in forecasts]
            
            print(f"Date: {date}")
            print(f"Temperature Range: {min(temps):.1f}°C - {max(temps):.1f}°C")
            print(f"Conditions: {', '.join(set(descriptions))}")
            print("-" * 50)
    else:
        print(f"Error: {response.status_code} - {response.text}")

def validate_date_format(date_str):
    """Validate date format and check if it's not too far in the future"""
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        today = datetime.now()
        
        if date_obj > today + timedelta(days=5):
            print("Warning: Free API only supports up to 5 days in the future")
            return False
        return True
    except ValueError:
        print("Invalid date format. Please use YYYY-MM-DD format")
        return False

# ---- MAIN ----
def main():
    print("Weather Prediction System")
    print("1. Current Weather")
    print("2. 5-Day Forecast (Free)")
    print("3. Specific Date Summary (Requires paid API)")
    
    choice = input("\nSelect option (1-3): ").strip()
    city_input = input("Enter city name in Sri Lanka: ").strip()
    
    try:
        lat, lon = get_lat_lon(city_input)
        print(f"Location: {lat}, {lon}\n")
        
        if choice == "1":
            get_weather_forecast(lat, lon)
        elif choice == "2":
            get_5day_forecast(lat, lon)
        elif choice == "3":
            date_input = input("Enter date (YYYY-MM-DD): ").strip()
            if validate_date_format(date_input):
                get_day_summary(lat, lon, date_input)
        else:
            print("Invalid choice!")
            
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
