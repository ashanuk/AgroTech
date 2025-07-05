# app/train.py

import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

from app.utils import create_sequences, save_model_artifacts
from app.config import MODEL_PATH, SCALER_PATH, DATA_PATH, LOOKBACK


def encode_columns(df):
    """Fit and encode the 3 categorical columns, return encoders for future use if needed"""
    item_encoder = LabelEncoder()
    type_encoder = LabelEncoder()
    place_encoder = LabelEncoder()

    df['Item_Name_encoded'] = item_encoder.fit_transform(df['Item_Name'])
    df['Selling_Type_encoded'] = type_encoder.fit_transform(df['Selling_Type'])
    df['Place_encoded'] = place_encoder.fit_transform(df['Place'])

    return df, item_encoder, type_encoder, place_encoder


def initial_train_model():
    df = pd.read_csv(DATA_PATH)
    df['Date'] = pd.to_datetime(df['Date'])

    # Encode categorical features
    df, _, _, _ = encode_columns(df)

    # Filter by encoded values
    df = df[
        (df['Item_Name_encoded'] == 0) &
        (df['Selling_Type_encoded'] == 0) &
        (df['Place_encoded'] == 0)
    ].copy()

    if df.empty:
        raise ValueError("❌ No data available for selected encoded values.")

    df = df[['Date', 'Price']].copy()

    # Fill missing dates
    df = df.set_index('Date')
    df = df.reindex(pd.date_range(start=df.index.min(), end='2025-01-01'), method='ffill')
    df = df.reset_index().rename(columns={'index': 'Date'})

    # Scale and sequence
    scaler = MinMaxScaler()
    df['Price_scaled'] = scaler.fit_transform(df[['Price']])
    values = df['Price_scaled'].values
    X, y = create_sequences(values, LOOKBACK)
    X = X.reshape((X.shape[0], LOOKBACK, 1))

    # Build and train model
    model = Sequential()
    model.add(LSTM(50, activation='relu', input_shape=(LOOKBACK, 1)))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=10, batch_size=32, verbose=1)

    # Save model and scaler
    save_model_artifacts(model, scaler)


def retrain_model(file, item_code: int, place_code: int, type_code: int):
    new_df = pd.read_csv(file.file)
    new_df['Date'] = pd.to_datetime(new_df['Date'])

    old_df = pd.read_csv(DATA_PATH)

    combined = pd.concat([old_df, new_df], ignore_index=True)
    combined = combined.drop_duplicates(subset=["Date"])
    combined.to_csv(DATA_PATH, index=False)

    # Retrain with filtered encoded values
    initial_train_model(item_code, place_code, type_code)
