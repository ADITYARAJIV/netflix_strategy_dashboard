import pandas as pd
import json
import os
import numpy as np

RAW_DATA = os.path.join('data', 'raw', 'netflix_titles.csv')
PROCESSED_DATA = os.path.join('data', 'processed', 'netflix_cleaned.json')

def clean_netflix_data():
    print("🚀 Starting data processing...")
    
    # Load data
    df = pd.read_csv(RAW_DATA)
    
    # 1. Fill basic missing metadata
    df['director'] = df['director'].fillna('Unknown')
    df['cast'] = df['cast'].fillna('Unknown')
    df['country'] = df['country'].fillna('Unknown')
    
    # 2. Clean Dates and handle NaT (Not a Time)
    df['date_added'] = pd.to_datetime(df['date_added'].str.strip(), errors='coerce')
    df['year_added'] = df['date_added'].dt.year.fillna(0).astype(int)
    # Inside clean_netflix_data function:
    df['month_added'] = df['date_added'].dt.month_name().fillna('Unknown')
    df['day_added'] = df['date_added'].dt.day_name().fillna('Unknown')
    
    # 3. CRITICAL: Replace all remaining NaN/inf values with None (which becomes null in JSON)
    # This fixes the "ValueError: nan" error
    df = df.replace({np.nan: None})
    
    # 4. Explode Genres
    df['listed_in'] = df['listed_in'].fillna('').str.split(', ')
    
    # Convert to list of dicts
    result = df.to_dict(orient='records')
    
    os.makedirs(os.path.dirname(PROCESSED_DATA), exist_ok=True)
    
    with open(PROCESSED_DATA, 'w') as f:
        # We use default=str as a safety net for any weird objects
        json.dump(result, f, indent=4, default=str)
        
    print(f"✅ Success! Cleaned data saved to {PROCESSED_DATA}")

if __name__ == "__main__":
    clean_netflix_data()