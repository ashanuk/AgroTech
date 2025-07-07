import requests
import urllib.parse
import time

# Step 1: Get coordinates from residence name
def get_coordinates(place_name):
    # URL encode the place name to handle spaces and special characters
    encoded_place = urllib.parse.quote(place_name)
    url = f"https://nominatim.openstreetmap.org/search?q={encoded_place}&format=json&limit=1"
    
    # Add headers to avoid being blocked
    headers = {
        'User-Agent': 'AgroTech-SoilApp/1.0 (your-email@example.com)'
    }
    
    try:
        print(f"Fetching coordinates for: {place_name}")
        print(f"URL: {url}")
        
        response = requests.get(url, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response text: {response.text[:200]}...")  # Show first 200 chars
        
        if response.status_code == 200:
            res = response.json()
            if res and len(res) > 0:
                lat = float(res[0]['lat'])
                lon = float(res[0]['lon'])
                print(f"Found coordinates: {lat}, {lon}")
                return lat, lon
            else:
                raise Exception(f"No coordinates found for '{place_name}'")
        else:
            raise Exception(f"API request failed with status {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error: {e}")
    except Exception as e:
        raise Exception(f"Error getting coordinates: {e}")

# Step 2: Get soil data from SoilGrids API
def get_soil_property(lat, lon, property_name):
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
                
                return None  # Property not found
            else:
                return None
        else:
            print(f"API request for {property_name} failed with status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error getting {property_name}: {e}")
        return None

def get_soil_data(lat, lon):
    """Get comprehensive soil data by making individual API calls"""
    print(f"Fetching soil data for coordinates: {lat}, {lon}")
    
    # Define properties and their conversion factors
    properties = {
        'phh2o': {'factor': 10, 'unit': 'pH units', 'name': 'pH'},
        'nitrogen': {'factor': 100, 'unit': 'g/kg', 'name': 'Nitrogen'},
        'phosav': {'factor': 1, 'unit': 'mg/kg', 'name': 'Phosphorus'},  # Available phosphorus
        'potasav': {'factor': 10, 'unit': 'cmol/kg', 'name': 'Potassium'}  # Available potassium
    }
    
    results = {}
    
    for prop_key, prop_info in properties.items():
        print(f"Fetching {prop_info['name']}...")
        raw_value = get_soil_property(lat, lon, prop_key)
        
        if raw_value is not None:
            converted_value = raw_value / prop_info['factor']
            results[prop_key] = converted_value
            print(f"{prop_info['name']} found - Raw: {raw_value}, Converted: {converted_value:.2f} {prop_info['unit']}")
        else:
            results[prop_key] = None
            print(f"{prop_info['name']} data is null for this location")
        
        # Add delay between requests to be respectful
        time.sleep(0.5)
    
    return results['phh2o'], results['nitrogen'], results['phosav'], results['potasav']

# Main execution
def main():
    res_name=input("Enter your residence : ")
    residence = res_name+", Sri Lanka"
    
    try:
        # Get coordinates
        lat, lon = get_coordinates(residence)
        
        # Add a small delay to be respectful to the APIs
        time.sleep(1)
        
        # Get soil data
        ph, nitrogen, phosphorus, potassium = get_soil_data(lat, lon)
        
        print(f"\n{'='*50}")
        print(f"COMPREHENSIVE SOIL DATA RESULTS")
        print(f"{'='*50}")
        print(f"Location: {residence}")
        print(f"Latitude: {lat:.6f}, Longitude: {lon:.6f}")
        print(f"{'='*50}")
        
        # Display all soil nutrients
        print("SOIL NUTRIENTS:")
        if ph is not None:
            print(f"• pH: {ph:.2f}")
        else:
            print("• pH: Not available")
            
        if nitrogen is not None:
            print(f"• Nitrogen (N): {nitrogen:.2f} g/kg")
        else:
            print("• Nitrogen (N): Not available")
            
        if phosphorus is not None:
            print(f"• Phosphorus (P): {phosphorus:.2f} mg/kg")
        else:
            print("• Phosphorus (P): Not available")
            
        if potassium is not None:
            print(f"• Potassium (K): {potassium:.2f} cmol/kg")
        else:
            print("• Potassium (K): Not available")
        
       
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
