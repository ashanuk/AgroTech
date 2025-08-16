# app/predict.py

import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError
from sklearn.preprocessing import LabelEncoder
from app.config import MODEL_PATH, SCALER_PATH, DATA_PATH, LOOKBACK


def predict_future_prices(n_days=60, item_code=0, type_code=0, place_code=0):
    # Load model and recompile with explicit loss
    model = load_model(f"{MODEL_PATH}rice_model.h5", compile=False)
    model.compile(optimizer='adam', loss=MeanSquaredError())

    # Load scaler
    scaler = joblib.load(SCALER_PATH)

    # Load and preprocess dataset
    df = pd.read_csv(f"{DATA_PATH}rice_cleaned.csv")
    df['Date'] = pd.to_datetime(df['Date'])

    # Encode categorical features
    le_item = LabelEncoder()
    le_type = LabelEncoder()
    le_place = LabelEncoder()
    df['Item_Name_encoded'] = le_item.fit_transform(df['Item_Name'])
    df['Selling_Type_encoded'] = le_type.fit_transform(df['Selling_Type'])
    df['Place_encoded'] = le_place.fit_transform(df['Place'])

    # Filter to match trained class
    df = df[
        (df['Item_Name_encoded'] == item_code) &
        (df['Selling_Type_encoded'] == type_code) &
        (df['Place_encoded'] == place_code)
    ].copy()

    # Drop unused
    df = df[['Date', 'Price']].copy()

    # Reindex and fill
    df = df.set_index('Date')
    df = df.reindex(pd.date_range(start=df.index.min(), end=df.index.max()), method='ffill')
    df = df.reset_index().rename(columns={'index': 'Date'})

    # Scale
    df['Price_scaled'] = scaler.transform(df[['Price']])

    # Predict future
    last_sequence = df['Price_scaled'].values[-LOOKBACK:].tolist()
    future_scaled = []

    for _ in range(n_days):
        x_input = np.array(last_sequence[-LOOKBACK:]).reshape(1, LOOKBACK, 1)
        pred = model.predict(x_input, verbose=0)[0][0]
        future_scaled.append(pred)
        last_sequence.append(pred)

    # Inverse scale and build DataFrame
    future_prices = scaler.inverse_transform(np.array(future_scaled).reshape(-1, 1)).flatten()
    last_date = df['Date'].max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=n_days)

    forecast_df = pd.DataFrame({
        'Date': future_dates,
        'Predicted_Price': future_prices
    })
    # print(forecast_df.head())
    return forecast_df, df[['Date', 'Price']]
