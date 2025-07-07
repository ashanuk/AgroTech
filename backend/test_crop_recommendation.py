#!/usr/bin/env python3
"""
Test script for the crop recommendation system
Demonstrates the functionality of returning only suitable crop names (>70% probability)
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_location_based():
    """Test location-based crop recommendations"""
    print("="*60)
    print("TESTING LOCATION-BASED CROP RECOMMENDATIONS")
    print("="*60)
    
    locations = [
        "balangoda, Sri Lanka",
        "Colombo, Sri Lanka",
        "Kandy, Sri Lanka",
        "Jaffna, Sri Lanka",
        "Galle, Sri Lanka",
        "Anuradhapura, Sri Lanka"
    ]
    
    for location in locations:
        try:
            response = requests.post(
                f"{BASE_URL}/crop-recommendation/suitable-crops",
                json={"location": location, "use_defaults": True}
            )
            
            if response.status_code == 200:
                crops = response.json()
                print(f"📍 {location}:")
                if crops:
                    print(f"   ✅ Suitable crops: {', '.join(crops)}")
                else:
                    print(f"   ❌ No crops with >70% probability")
            else:
                print(f"❌ {location}: Error {response.status_code}")
                
        except Exception as e:
            print(f"❌ {location}: Connection error - {e}")
        
        print()

def test_manual_input():
    """Test manual input crop recommendations"""
    print("="*60)
    print("TESTING MANUAL INPUT CROP RECOMMENDATIONS")
    print("="*60)
    
    test_cases = [
        {
            "name": "Rice-favorable conditions",
            "nitrogen": 90,
            "temperature": 23.75,
            "humidity": 82.32,
            "ph": 6.5,
            "rainfall": 200.98
        },
        {
            "name": "Dry climate conditions",
            "nitrogen": 40,
            "temperature": 35,
            "humidity": 30,
            "ph": 7.5,
            "rainfall": 20
        },
        {
            "name": "Temperate climate",
            "nitrogen": 60,
            "temperature": 20,
            "humidity": 65,
            "ph": 6.8,
            "rainfall": 100
        },
        {
            "name": "High nitrogen, moderate conditions",
            "nitrogen": 120,
            "temperature": 25,
            "humidity": 70,
            "ph": 6.0,
            "rainfall": 80
        }
    ]
    
    for case in test_cases:
        try:
            # Extract the test data
            test_data = {k: v for k, v in case.items() if k != "name"}
            
            response = requests.post(
                f"{BASE_URL}/crop-recommendation/suitable-crops/manual",
                json=test_data
            )
            
            if response.status_code == 200:
                crops = response.json()
                print(f"🧪 {case['name']}:")
                print(f"   Input: N={case['nitrogen']}, T={case['temperature']}°C, H={case['humidity']}%, pH={case['ph']}, R={case['rainfall']}mm")
                if crops:
                    print(f"   ✅ Suitable crops: {', '.join(crops)}")
                else:
                    print(f"   ❌ No crops with >70% probability")
            else:
                print(f"❌ {case['name']}: Error {response.status_code}")
                
        except Exception as e:
            print(f"❌ {case['name']}: Connection error - {e}")
        
        print()

def main():
    """Main test function"""
    print("🌾 CROP RECOMMENDATION SYSTEM TEST")
    print("Testing endpoints that return only suitable crop names (>70% probability)")
    print()
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("❌ Server not responding properly. Please start the FastAPI server first.")
            print("   Run: uvicorn app.main:app --reload")
            return
    except:
        print("❌ Cannot connect to server. Please start the FastAPI server first.")
        print("   Run: uvicorn app.main:app --reload")
        return
    
    print("✅ Server is running!")
    print()
    
    # Run tests
    test_location_based()
    test_manual_input()
    
    print("="*60)
    print("✅ TESTING COMPLETE!")
    print("="*60)
    print()
    print("📝 Summary:")
    print("- Both endpoints now return simple lists of crop names")
    print("- Only crops with >70% prediction probability are included")  
    print("- Location-based endpoint: /crop-recommendation/suitable-crops")
    print("- Manual input endpoint: /crop-recommendation/suitable-crops/manual")
    print()
    print("🔧 API Usage Examples:")
    print("Location-based:")
    print('  POST /crop-recommendation/suitable-crops')
    print('  Body: {"location": "Mumbai, India", "use_defaults": true}')
    print('  Returns: ["rice", "cotton", ...]')
    print()
    print("Manual input:")
    print('  POST /crop-recommendation/suitable-crops/manual')
    print('  Body: {"nitrogen": 90, "temperature": 23.75, "humidity": 82.32, "ph": 6.5, "rainfall": 200.98}')
    print('  Returns: ["rice"]')

if __name__ == "__main__":
    main()
