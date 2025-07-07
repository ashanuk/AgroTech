import requests
from datetime import datetime, timedelta

API_KEY = '18fd856d30b48d870d2d9c7f709e6227'

def get_lat_lon(city):
    """Convert city name to latitude and longitude"""
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
    Predict weather for a specific date and city
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
        
        if days_diff < 0:
            print("Note: This is a past date. Using historical data approach...")
            get_day_summary_paid_api(lat, lon, target_date)
        elif days_diff <= 5:
            print("Using 5-day forecast (Free API)...")
            get_forecast_for_specific_date(lat, lon, target_date)
        else:
            print("Error: Free API only supports up to 5 days in the future.")
            print("For longer forecasts, you need a paid subscription.")
            
    except ValueError:
        print("Invalid date format. Please use YYYY-MM-DD format (e.g., 2025-07-10)")
    except Exception as e:
        print(f"Error: {e}")

def get_forecast_for_specific_date(lat, lon, target_date):
    """Get forecast for a specific date within 5 days (Free API)"""
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
        
        # Find forecasts for the target date
        target_forecasts = []
        for item in data['list']:
            forecast_date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            if forecast_date == target_date:
                target_forecasts.append(item)
        
        if target_forecasts:
            print(f"\nWeather Forecast for {target_date}:")
            print("=" * 50)
            
            temps = [f['main']['temp'] for f in target_forecasts]
            humidity_vals = [f['main']['humidity'] for f in target_forecasts]
            descriptions = [f['weather'][0]['description'] for f in target_forecasts]
            
            print(f"Temperature Range: {min(temps):.1f}°C - {max(temps):.1f}°C")
            print(f"Average Humidity: {sum(humidity_vals)/len(humidity_vals):.0f}%")
            print(f"Weather Conditions: {', '.join(set(descriptions))}")
            
            print(f"\nHourly Breakdown for {target_date}:")
            for forecast in target_forecasts:
                time = datetime.fromtimestamp(forecast['dt']).strftime('%H:%M')
                temp = forecast['main']['temp']
                desc = forecast['weather'][0]['description']
                print(f"  {time}: {temp}°C, {desc}")
        else:
            print(f"No forecast data available for {target_date}")
    else:
        print(f"Error fetching forecast: {response.status_code} - {response.text}")

def get_day_summary_paid_api(lat, lon, date_str):
    """Get weather summary using paid One Call Day Summary API"""
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
        print(f"\nWeather Summary for {date_str}:")
        print("=" * 50)
        print(f"Temperature - Max: {data['temperature']['max']}°C, Min: {data['temperature']['min']}°C")
        print(f"Feels Like - Max: {data['temperature']['feels_like_max']}°C, Min: {data['temperature']['feels_like_min']}°C")
        print(f"Humidity: {data['humidity']['afternoon']}%")
        print(f"Pressure: {data['pressure']['afternoon']} hPa")
        if 'precipitation' in data and data['precipitation']['total'] > 0:
            print(f"Precipitation: {data['precipitation']['total']} mm")
    else:
        print(f"Error: {response.status_code} - {response.text}")
        if response.status_code == 401:
            print("Note: This API requires a paid subscription to OpenWeatherMap")

def main():
    print("Weather Predictor - Enter City and Date")
    print("=" * 40)
    
    city = input("Enter city name in Sri Lanka: ").strip()
    date = input("Enter date (YYYY-MM-DD): ").strip()
    
    predict_weather_for_date(city, date)

if __name__ == "__main__":
    main()
