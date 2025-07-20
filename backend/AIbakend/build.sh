#!/usr/bin/env bash
# Build script for Render

# Install dependencies
pip install -r app/requirements.txt

# Create necessary directories
mkdir -p model
mkdir -p data

# Note: Make sure to upload your model files (rice_model.h5, rice_scaler.pkl, cropOnWeather.pkl) 
# to the model/ directory before deployment or download them during build if stored externally
