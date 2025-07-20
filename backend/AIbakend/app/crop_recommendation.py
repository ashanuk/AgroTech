import pickle
import numpy as np
import os
from typing import Dict, List, Optional, Tuple
from app.data_integrator import DataIntegrator

class CropRecommendationSystem:
    """Crop recommendation system that uses integrated soil, weather, and rainfall data"""
    
    def __init__(self):
        self.data_integrator = DataIntegrator()
        self.model = None
        self.model_path = os.path.join(os.path.dirname(__file__), '..', 'model', 'cropOnWeather.pkl')
        self.load_model()
        
        # Crop labels that match your model's class mapping (0-21)
        self.crop_labels = [
            'apple',        # 0
            'banana',       # 1
            'blackgram',    # 2
            'chickpea',     # 3
            'coconut',      # 4
            'coffee',       # 5
            'cotton',       # 6
            'grapes',       # 7
            'jute',         # 8
            'kidneybeans',  # 9
            'lentil',       # 10
            'maize',        # 11
            'mango',        # 12
            'mothbeans',    # 13
            'mungbean',     # 14
            'muskmelon',    # 15
            'orange',       # 16
            'papaya',       # 17
            'pigeonpeas',   # 18
            'pomegranate',  # 19
            'rice',         # 20
            'watermelon'    # 21
        ]
    
    def load_model(self):
        """Load the crop recommendation model"""
        try:
            if os.path.exists(self.model_path):
                # Try different pickle protocols
                for protocol in [None, 0, 1, 2, 3, 4, 5]:
                    try:
                        with open(self.model_path, 'rb') as f:
                            if protocol is None:
                                self.model = pickle.load(f)
                            else:
                                self.model = pickle.load(f, fix_imports=True, encoding='latin1')
                        print(f"Crop recommendation model loaded successfully using protocol {protocol}")
                        print(f"Model type: {type(self.model)}")
                        return
                    except Exception as e:
                        if protocol == 5:  # Last attempt
                            print(f"Failed to load with protocol {protocol}: {e}")
                        continue
                
                # If all protocols fail, try with joblib
                try:
                    import joblib
                    self.model = joblib.load(self.model_path)
                    print("Crop recommendation model loaded successfully using joblib")
                    print(f"Model type: {type(self.model)}")
                    return
                except:
                    pass
                    
                print(f"Error: Could not load model from {self.model_path}")
                print("Using rule-based crop recommendation system as fallback")
                self.model = None
            else:
                print(f"Warning: Model file not found at {self.model_path}")
                print("Using rule-based crop recommendation system")
                self.model = None
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Using rule-based crop recommendation system")
            self.model = None
    
    def get_crop_recommendations(self, location: str, use_defaults: bool = False) -> Dict:
        """
        Get crop recommendations based on location data
        
        Args:
            location: Location name (e.g., "Matale, Sri Lanka")
            use_defaults: If True, use default values for missing data
            
        Returns:
            Dictionary containing recommendations and data used
        """
        try:
            # Get integrated data
            data = self.data_integrator.get_all_data(location)
            
            # Validate data
            is_valid, missing_fields = self.data_integrator.validate_data(data)
            
            if not is_valid:
                if use_defaults:
                    data = self._apply_default_values(data, missing_fields)
                    print(f"Warning: Using default values for missing fields: {missing_fields}")
                else:
                    return {
                        'success': False,
                        'error': f'Missing required data: {missing_fields}',
                        'data': data
                    }
            
            # Prepare model input
            model_input = self.data_integrator.prepare_model_input(data)
            
            # Get crop recommendations from model (or fallback to rules)
            recommendations = self._predict_crops(model_input)
            
            return {
                'success': True,
                'location': location,
                'coordinates': data['coordinates'],
                'environmental_data': {
                    'nitrogen': data['nitrogen'],
                    'temperature': data['temperature'],
                    'ph': data['ph'],
                    'rainfall': data['rainfall'],
                    'humidity': data['humidity']
                },
                'recommendations': recommendations,
                'data_sources': {
                    'soil_data': 'SoilGrids API',
                    'weather_data': 'OpenWeatherMap API',
                    'rainfall_data': 'Open-Meteo API'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': None
            }
    
    def _predict_crops(self, model_input: Dict) -> List[Dict]:
        """
        Predict suitable crops based on input parameters using ML model only
        
        Args:
            model_input: Dictionary with N, temperature, ph, rainfall, humidity
            
        Returns:
            List of crop recommendations with confidence scores
        """
        try:
            if self.model is not None:
                # Use machine learning model
                return self._predict_with_ml_model(model_input)
            else:
                # Return error if model is not available
                return [{
                    'rank': 1,
                    'crop': 'error',
                    'confidence': 0.0,
                    'confidence_percentage': "0.0%",
                    'note': 'ML model not available - please check model file'
                }]
                
        except Exception as e:
            print(f"Error making prediction: {e}")
            return [{
                'rank': 1,
                'crop': 'error',
                'confidence': 0.0,
                'confidence_percentage': "0.0%",
                'note': f"Prediction error: {str(e)}"
            }]
    
    def _predict_with_ml_model(self, model_input: Dict) -> List[Dict]:
        """Use machine learning model for prediction"""
        try:
            # Prepare input array for the model
            # Your model expects exactly 5 features: ['N', 'temperature', 'humidity', 'ph', 'rainfall']
            input_array = np.array([[
                model_input.get('N', 20.0),                    # Nitrogen
                model_input.get('temperature', 25.0),          # Temperature
                model_input.get('humidity', 75.0),             # Humidity
                model_input.get('ph', 6.5),                    # pH
                model_input.get('rainfall', 100.0)             # Rainfall
            ]])
            
            print(f"Model input array (5 features): {input_array}")
            print(f"Input shape: {input_array.shape}")
            
            # Make prediction
            if hasattr(self.model, 'predict_proba'):
                # If model supports probability prediction (classification)
                probabilities = self.model.predict_proba(input_array)[0]
                print(f"Model probabilities: {probabilities}")
                print(f"Number of classes: {len(probabilities)}")
                
                # Find all crops with probability > 0.7 (suitable crops)
                suitable_crops = []
                other_crops = []
                
                for idx, prob in enumerate(probabilities):
                    crop_name = self.crop_labels[idx] if idx < len(self.crop_labels) else f"Crop_{idx}"
                    
                    if prob > 0.2:
                        # Crops with >70% probability are "suitable crops"
                        suitable_crops.append({
                            'crop': crop_name,
                            'confidence': float(prob),
                            'confidence_percentage': f"{prob*100:.1f}%",
                            'suitability': 'suitable',
                            'method': 'ML model'
                        })
                    elif prob > 0.05:
                        # Other crops with >5% probability
                        other_crops.append({
                            'crop': crop_name,
                            'confidence': float(prob),
                            'confidence_percentage': f"{prob*100:.1f}%",
                            'suitability': 'possible',
                            'method': 'ML model'
                        })
                
                # Sort suitable crops by confidence (highest first)
                suitable_crops.sort(key=lambda x: x['confidence'], reverse=True)
                
                # Sort other crops by confidence (highest first) and take top 3
                other_crops.sort(key=lambda x: x['confidence'], reverse=True)
                other_crops = other_crops[:3]
                
                # Combine results: suitable crops first, then other top crops
                recommendations = []
                
                # Add suitable crops (>70% probability) first
                for i, crop in enumerate(suitable_crops):
                    crop['rank'] = i + 1
                    recommendations.append(crop)
                
                # Add other top crops if we have space and no suitable crops found
                if not suitable_crops:
                    for i, crop in enumerate(other_crops):
                        crop['rank'] = i + 1
                        recommendations.append(crop)
                
                # If still no recommendations, return the best one
                if not recommendations:
                    best_idx = np.argmax(probabilities)
                    crop_name = self.crop_labels[best_idx] if best_idx < len(self.crop_labels) else f"Crop_{best_idx}"
                    recommendations.append({
                        'rank': 1,
                        'crop': crop_name,
                        'confidence': float(probabilities[best_idx]),
                        'confidence_percentage': f"{probabilities[best_idx]*100:.1f}%",
                        'suitability': 'possible',
                        'method': 'ML model'
                    })
                
                # Print summary
                if suitable_crops:
                    print(f"Found {len(suitable_crops)} suitable crop(s) with >70% probability:")
                    for crop in suitable_crops:
                        print(f"  - {crop['crop']}: {crop['confidence_percentage']}")
                else:
                    print("No crops found with >70% probability. Showing other possibilities.")
                
                return recommendations
            
            else:
                # If model only supports single prediction
                prediction = self.model.predict(input_array)[0]
                crop_name = self.crop_labels[prediction] if prediction < len(self.crop_labels) else f"Crop_{prediction}"
                
                return [{
                    'rank': 1,
                    'crop': crop_name,
                    'confidence': 1.0,
                    'confidence_percentage': "100.0%",
                    'method': 'ML model',
                    'suitability': 'suitable'
                }]
                
        except Exception as e:
            print(f"Error in ML model prediction: {e}")
            # Fallback to rule-based system
            return self._predict_with_rules(model_input)
    
    def _predict_with_rules(self, model_input: Dict) -> List[Dict]:
        """Use rule-based system for crop recommendation when ML model is not available"""
        recommendations = []
        
        # Get parameters
        temperature = model_input.get('temperature', 25)
        ph = model_input.get('ph', 6.5)
        rainfall = model_input.get('rainfall', 100)
        nitrogen = model_input.get('N', 20)
        humidity = model_input.get('humidity', 75)
        
        # Rule-based crop recommendations for Sri Lanka
        crop_scores = {}
        
        # Rice - very suitable for Sri Lanka
        rice_score = 0.7  # Base score
        if 5.5 <= ph <= 7.0:
            rice_score += 0.1
        if 150 <= rainfall <= 400:
            rice_score += 0.15
        if 22 <= temperature <= 32:
            rice_score += 0.1
        if humidity >= 70:
            rice_score += 0.05
        crop_scores['rice'] = min(rice_score, 1.0)
        
        # Maize
        maize_score = 0.6
        if 6.0 <= ph <= 7.5:
            maize_score += 0.1
        if 50 <= rainfall <= 200:
            maize_score += 0.15
        if 18 <= temperature <= 30:
            maize_score += 0.1
        if nitrogen >= 20:
            maize_score += 0.05
        crop_scores['maize'] = min(maize_score, 1.0)
        
        # Coconut
        coconut_score = 0.5
        if 6.0 <= ph <= 7.5:
            coconut_score += 0.1
        if 100 <= rainfall <= 300:
            coconut_score += 0.15
        if 25 <= temperature <= 35:
            coconut_score += 0.15
        if humidity >= 60:
            coconut_score += 0.1
        crop_scores['coconut'] = min(coconut_score, 1.0)
        
        # Banana
        banana_score = 0.5
        if 6.0 <= ph <= 7.5:
            banana_score += 0.1
        if 100 <= rainfall <= 250:
            banana_score += 0.15
        if 24 <= temperature <= 30:
            banana_score += 0.15
        if humidity >= 75:
            banana_score += 0.1
        crop_scores['banana'] = min(banana_score, 1.0)
        
        # Mango
        mango_score = 0.4
        if 6.0 <= ph <= 7.5:
            mango_score += 0.1
        if 50 <= rainfall <= 150:
            mango_score += 0.15
        if 24 <= temperature <= 32:
            mango_score += 0.15
        if humidity >= 50:
            mango_score += 0.1
        crop_scores['mango'] = min(mango_score, 1.0)
        
        # Tea (special case for higher altitude/cooler areas)
        if temperature < 25:
            tea_score = 0.6
            if 4.5 <= ph <= 6.0:
                tea_score += 0.15
            if 120 <= rainfall <= 250:
                tea_score += 0.15
            if 18 <= temperature <= 24:
                tea_score += 0.1
            crop_scores['tea'] = min(tea_score, 1.0)
        
        # Sort by score and return top recommendations
        sorted_crops = sorted(crop_scores.items(), key=lambda x: x[1], reverse=True)
        
        for i, (crop, score) in enumerate(sorted_crops[:3]):
            if score > 0.4:  # Only include if score > 40%
                recommendations.append({
                    'rank': i + 1,
                    'crop': crop,
                    'confidence': score,
                    'confidence_percentage': f"{score*100:.1f}%",
                    'method': 'rule-based'
                })
        
        # If no good recommendations, provide default
        if not recommendations:
            recommendations.append({
                'rank': 1,
                'crop': 'rice',
                'confidence': 0.5,
                'confidence_percentage': "50.0%",
                'method': 'rule-based',
                'note': 'Default recommendation - Rice is generally suitable for Sri Lankan conditions'
            })
        
        return recommendations
    
    def _apply_default_values(self, data: Dict, missing_fields: List[str]) -> Dict:
        """Apply default values for missing fields"""
        defaults = {
            'nitrogen': 20.0,      # Default nitrogen value
            'temperature': 28.0,    # Default temperature for Sri Lanka
            'ph': 6.5,             # Default pH
            'rainfall': 150.0,      # Default rainfall
            'humidity': 75.0        # Default humidity
        }
        
        for field in missing_fields:
            if field in defaults:
                data[field] = defaults[field]
        
        return data
    
    def get_crop_details(self, crop_name: str) -> Dict:
        """Get detailed information about a specific crop"""
        # This is a basic implementation - you can expand this with more detailed crop information
        crop_info = {
            'rice': {
                'name': 'Rice',
                'scientific_name': 'Oryza sativa',
                'growing_season': 'Maha and Yala seasons',
                'water_requirements': 'High - requires flooded fields',
                'soil_requirements': 'pH 5.5-7.0, well-drained clay loam',
                'temperature_range': '20-35°C',
                'harvest_time': '3-4 months',
                'tips': 'Ensure proper water management and pest control'
            },
            'maize': {
                'name': 'Maize (Corn)',
                'scientific_name': 'Zea mays',
                'growing_season': 'Year-round with irrigation',
                'water_requirements': 'Moderate - requires consistent moisture',
                'soil_requirements': 'pH 6.0-7.5, well-drained fertile soil',
                'temperature_range': '18-32°C',
                'harvest_time': '3-4 months',
                'tips': 'Provide adequate spacing and regular fertilization'
            },
            # Add more crops as needed
        }
        
        return crop_info.get(crop_name.lower(), {
            'name': crop_name.title(),
            'note': 'Detailed information not available for this crop'
        })
