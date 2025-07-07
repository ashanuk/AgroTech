import sys
import os

# Add the crop_on_weather directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'crop_on_weather'))

import requests
from datetime import datetime
import urllib.parse
import calendar
import time

class DataIntegrator:
    """Integrates soil, weather, and rainfall data for crop recommendation"""
    
    def __init__(self):
        self.weather_api_key = '18fd856d30b48d870d2d9c7f709e6227'
    
    def get_coordinates(self, location):
        """Get coordinates from location name"""
        encoded_place = urllib.parse.quote(location)
        url = f"https://nominatim.openstreetmap.org/search?q={encoded_place}&format=json&limit=1"
        
        headers = {
            'User-Agent': 'AgroTech-CropRecommendation/1.0 (contact@example.com)'
        }
        
        try:
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                res = response.json()
                if res and len(res) > 0:
                    lat = float(res[0]['lat'])
                    lon = float(res[0]['lon'])
                    return lat, lon
                else:
                    raise Exception(f"No coordinates found for '{location}'")
            else:
                raise Exception(f"Geocoding API request failed with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error: {e}")
    
    def get_soil_data(self, lat, lon):
        """Get soil pH and nitrogen data"""
        try:
            # Get pH
            ph = self._get_soil_property(lat, lon, 'phh2o')
            if ph is not None:
                ph = ph / 10  # Convert from pH*10 to pH
            
            # Get nitrogen
            nitrogen = self._get_soil_property(lat, lon, 'nitrogen')
            if nitrogen is not None:
                nitrogen = nitrogen / 100  # Convert from cg/kg to g/kg
            
            return ph, nitrogen
        except Exception as e:
            print(f"Error getting soil data: {e}")
            return None, None
    
    def _get_soil_property(self, lat, lon, property_name):
        """Get a single soil property from SoilGrids API"""
        url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property={property_name}&depth=0-5cm"
        
        try:
            response = requests.get(url)
            
            if response.status_code == 200:
                res = response.json()
                
                if 'properties' in res and 'layers' in res['properties']:
                    layers = res['properties']['layers']
                    
                    for layer in layers:
                        if layer['name'] == property_name:
                            raw_value = layer['depths'][0]['values']['mean']
                            return raw_value
                
                return None
            else:
                return None
                
        except Exception as e:
            return None
    
    def get_weather_data(self, lat, lon):
        """Get current weather data (temperature and humidity)"""
        weather_url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': lat,
            'lon': lon,
            'units': 'metric',
            'appid': self.weather_api_key
        }
        
        try:
            response = requests.get(weather_url, params=params)
            if response.status_code == 200:
                data = response.json()
                temp = data['main']['temp']
                humidity = data['main']['humidity']
                return temp, humidity
            else:
                return None, None
        except Exception as e:
            print(f"Error getting weather data: {e}")
            return None, None
    
    def get_rainfall_data(self, lat, lon):
        """Get monthly rainfall data"""
        try:
            # Get current/previous month rainfall
            now = datetime.now()
            year = now.year
            month = now.month
            
            # If early in the month, use previous month
            if now.day < 15:
                month = month - 1
                if month == 0:
                    month = 12
                    year = year - 1
            
            return self._get_monthly_rainfall(lat, lon, year, month)
        except Exception as e:
            print(f"Error getting rainfall data: {e}")
            return None
    
    def _get_monthly_rainfall(self, lat, lon, year, month):
        """Get rainfall for a specific month"""
        days_in_month = calendar.monthrange(year, month)[1]
        
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": f"{year}-{month:02d}-01",
            "end_date": f"{year}-{month:02d}-{days_in_month:02d}",
            "daily": "precipitation_sum",
            "timezone": "auto"
        }
        
        try:
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                res = response.json()
                
                if 'daily' in res and 'precipitation_sum' in res['daily']:
                    daily_rain = res['daily']['precipitation_sum']
                    daily_rain = [float(rain) for rain in daily_rain if rain is not None]
                    
                    if daily_rain:
                        total_rainfall = sum(daily_rain)
                        return total_rainfall
                    else:
                        return 0
                else:
                    return None
            else:
                return None
                
        except Exception as e:
            return None
    
    def get_all_data(self, location):
        """Get all required data for crop recommendation"""
        try:
            print(f"Getting data for location: {location}")
            
            # Get coordinates
            lat, lon = self.get_coordinates(location)
            print(f"Coordinates: {lat:.6f}, {lon:.6f}")
            
            # Get soil data (N and pH)
            print("Fetching soil data...")
            ph, nitrogen = self.get_soil_data(lat, lon)
            time.sleep(1)  # Be respectful to APIs
            
            # Get weather data (temperature and humidity)
            print("Fetching weather data...")
            temperature, humidity = self.get_weather_data(lat, lon)
            time.sleep(1)
            
            # Get rainfall data
            print("Fetching rainfall data...")
            rainfall = self.get_rainfall_data(lat, lon)
            
            # Compile results
            data = {
                'location': location,
                'coordinates': {'lat': lat, 'lon': lon},
                'nitrogen': nitrogen,
                'temperature': temperature,
                'ph': ph,
                'rainfall': rainfall,
                'humidity': humidity
            }
            
            return data
            
        except Exception as e:
            raise Exception(f"Error collecting data: {e}")
    
    def validate_data(self, data):
        """Validate that all required data is available"""
        required_fields = ['nitrogen', 'temperature', 'ph', 'rainfall', 'humidity']
        missing_fields = []
        
        for field in required_fields:
            if data.get(field) is None:
                missing_fields.append(field)
        
        if missing_fields:
            return False, missing_fields
        
        return True, []
    
    def prepare_model_input(self, data):
        """Prepare data in the format expected by the crop recommendation model"""
        return {
            'N': data['nitrogen'],
            'temperature': data['temperature'], 
            'ph': data['ph'],
            'rainfall': data['rainfall'],
            'humidity': data['humidity']
        }
