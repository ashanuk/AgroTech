import requests
from datetime import datetime
import urllib.parse
import calendar

def get_coordinates(place_name):
    """Get coordinates from place name using OpenStreetMap Nominatim API"""
    encoded_place = urllib.parse.quote(place_name)
    url = f"https://nominatim.openstreetmap.org/search?q={encoded_place}&format=json&limit=1"
    
    headers = {
        'User-Agent': 'AgroTech-RainfallApp/1.0 (contact@example.com)'
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
                raise Exception(f"No coordinates found for '{place_name}'")
        else:
            raise Exception(f"Geocoding API request failed with status {response.status_code}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error: {e}")

def get_monthly_rainfall(lat, lon, year, month):
    """Get monthly rainfall data from Open-Meteo API"""
    # Get the number of days in the specified month
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
        print(f"Fetching rainfall data for coordinates: {lat:.6f}, {lon:.6f}")
        print(f"Period: {calendar.month_name[month]} {year}")
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            res = response.json()
            
            if 'daily' in res and 'precipitation_sum' in res['daily']:
                daily_rain = res['daily']['precipitation_sum']
                # Filter out None values and convert to float
                daily_rain = [float(rain) for rain in daily_rain if rain is not None]
                
                if daily_rain:
                    total_rainfall = sum(daily_rain)
                    average_rainfall = total_rainfall / len(daily_rain)
                    return total_rainfall, average_rainfall, daily_rain
                else:
                    return 0, 0, []
            else:
                raise Exception("Precipitation data not found in API response")
        else:
            raise Exception(f"Weather API request failed with status {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error accessing weather API: {e}")
    except Exception as e:
        raise Exception(f"Error getting rainfall data: {e}")

def analyze_monthly_rainfall(location, lat, lon, year, month, total_rainfall, average_rainfall, daily_rain):
    """Analyze and display monthly rainfall data"""
    print(f"\n{'='*60}")
    print(f"MONTHLY RAINFALL ANALYSIS")
    print(f"{'='*60}")
    print(f"Location: {location}")
    print(f"Coordinates: {lat:.6f}°N, {lon:.6f}°E")
    print(f"Period: {calendar.month_name[month]} {year}")
    print(f"{'='*60}")
    
    print(f"\nRAINFALL SUMMARY:")
    print(f"Total Monthly Rainfall: {total_rainfall:.2f} mm")
    print(f"Average Daily Rainfall: {average_rainfall:.2f} mm/day")
    print(f"Days with rainfall: {len([r for r in daily_rain if r > 0])}")
    print(f"Days in month: {len(daily_rain)}")
    
    # Rainfall classification for Sri Lanka (monthly)
    print(f"\nRAINFALL CLASSIFICATION FOR {calendar.month_name[month].upper()}:")
    
    # Sri Lanka typical monthly rainfall ranges
    if month in [5, 6, 7, 8, 9, 10]:  # Southwest monsoon months
        if total_rainfall < 100:
            classification = "Very Low"
            recommendation = "Drought conditions - irrigation essential"
        elif total_rainfall < 200:
            classification = "Low"
            recommendation = "Below average - supplemental irrigation recommended"
        elif total_rainfall < 300:
            classification = "Moderate"
            recommendation = "Average rainfall for monsoon season"
        elif total_rainfall < 400:
            classification = "High"
            recommendation = "Above average - good for agriculture"
        else:
            classification = "Very High"
            recommendation = "Abundant rainfall - check drainage systems"
    else:  # Dry season months
        if total_rainfall < 50:
            classification = "Very Low"
            recommendation = "Typical dry season - irrigation required"
        elif total_rainfall < 100:
            classification = "Low"
            recommendation = "Below average for dry season"
        elif total_rainfall < 150:
            classification = "Moderate"
            recommendation = "Average rainfall for dry season"
        elif total_rainfall < 200:
            classification = "High"
            recommendation = "Above average - good soil moisture"
        else:
            classification = "Very High"
            recommendation = "Unusual heavy rainfall for dry season"
    
    print(f"Classification: {classification}")
    print(f"Recommendation: {recommendation}")
    
    # Daily rainfall statistics
    if daily_rain:
        max_daily = max(daily_rain)
        min_daily = min(daily_rain)
        
        print(f"\nDAILY STATISTICS:")
        print(f"Maximum daily rainfall: {max_daily:.2f} mm")
        print(f"Minimum daily rainfall: {min_daily:.2f} mm")
        
        # Count rainy days by intensity
        light_rain = len([r for r in daily_rain if 0.1 <= r < 2.5])
        moderate_rain = len([r for r in daily_rain if 2.5 <= r < 10])
        heavy_rain = len([r for r in daily_rain if 10 <= r < 50])
        very_heavy_rain = len([r for r in daily_rain if r >= 50])
        
        print(f"\nRAINFALL INTENSITY BREAKDOWN:")
        print(f"Light rain days (0.1-2.4 mm): {light_rain}")
        print(f"Moderate rain days (2.5-9.9 mm): {moderate_rain}")
        print(f"Heavy rain days (10-49.9 mm): {heavy_rain}")
        print(f"Very heavy rain days (≥50 mm): {very_heavy_rain}")
    
    print(f"\n{'='*60}")
    print(f"AGRICULTURAL INSIGHTS:")
    
    # Crop-specific recommendations
    if month in [4, 5, 10, 11]:  # Planting seasons
        if total_rainfall >= 150:
            print("• Excellent conditions for rice planting")
            print("• Good time for vegetable cultivation")
        else:
            print("• Consider irrigation for successful planting")
            print("• Delay planting until more rainfall")
    
    if month in [6, 7, 8, 9]:  # Growing season
        if total_rainfall >= 200:
            print("• Optimal growing conditions")
            print("• Monitor for pest and disease due to high humidity")
        else:
            print("• Crops may need supplemental irrigation")
            print("• Consider drought-resistant varieties")
    
    if month in [12, 1, 2, 3]:  # Harvest/dry season
        if total_rainfall < 100:
            print("• Good conditions for harvesting and drying")
            print("• Prepare irrigation systems for next planting")
        else:
            print("• Protect harvested crops from moisture")
            print("• Consider covered storage")
    
    print(f"{'='*60}")

def main():
    print("Monthly Rainfall Analysis Tool")
    print("=" * 35)
    
    # Get current year and month automatically
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    # If we're early in the month, use the previous complete month
    if now.day < 15:  # If it's before the 15th of the month
        current_month = current_month - 1
        if current_month == 0:  # If it's January, go to December of previous year
            current_month = 12
            current_year = current_year - 1
    
    print(f"Current Date: {now.strftime('%B %d, %Y')}")
    print(f"Analyzing rainfall for: {calendar.month_name[current_month]} {current_year}")
    
    # Get residence input
    residence = input(f"\nEnter your residence: ").strip()
    
    if not residence:
        residence = "Matale"
        print(f"Using default residence: {residence}")
    
    # Add Sri Lanka if not specified
    if "sri lanka" not in residence.lower():
        location = f"{residence}, Sri Lanka"
    else:
        location = residence
    
    try:
        print(f"\nStep 1: Getting coordinates for {location}...")
        lat, lon = get_coordinates(location)
        print(f"Found coordinates: {lat:.6f}, {lon:.6f}")
        
        print(f"\nStep 2: Fetching rainfall data for {calendar.month_name[current_month]} {current_year}...")
        total_rainfall, average_rainfall, daily_rain = get_monthly_rainfall(lat, lon, current_year, current_month)
        
        print(f"\nStep 3: Analyzing monthly rainfall data...")
        analyze_monthly_rainfall(location, lat, lon, current_year, current_month, total_rainfall, average_rainfall, daily_rain)
        
        # Highlight the main result
        print(f"\n{'='*60}")
        print(f"🌧️  MAIN RESULT FOR {residence.upper()}")
        print(f"{'='*60}")
        print(f"Average Daily Rainfall in {calendar.month_name[current_month]} {current_year}: {average_rainfall:.2f} mm/day")
        print(f"Total Monthly Rainfall: {total_rainfall:.2f} mm")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nTip: Try entering a well-known city name like 'Colombo', 'Kandy', 'Matale', or 'Galle'")

if __name__ == "__main__":
    main()
