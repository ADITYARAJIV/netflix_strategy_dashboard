from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# 1. Setup CORS properly
# Add your local development URL and your production Vercel URL
origins = [
    "http://localhost:3000",
    "https://netflix-strategy-dashboard.vercel.app", # <--- REPLACE WITH YOUR ACTUAL VERCEL URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get the absolute path to your data
def get_json_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # We join 'data/processed' as one string because that's how it appears in your repo
    path = os.path.join(base_dir, 'data/processed', 'netflix_cleaned.json')
    
    # FALLBACK: If the above fails, check the standard nested way too
    path_nested = os.path.join(base_dir, 'data', 'processed', 'netflix_cleaned.json')

    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    elif os.path.exists(path_nested):
        with open(path_nested, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        raise FileNotFoundError(f"Checked both: {path} and {path_nested}")

@app.get("/api/data")
def get_data():
    try:
        return get_json_data()
    except Exception as e:
        return {"error": f"Could not load data: {str(e)}"}

@app.get("/api/stats")
def get_stats():
    try:
        data = get_json_data()
        return {
            "total_titles": len(data),
            "movies": len([d for d in data if d.get('type') == 'Movie']),
            "tv_shows": len([d for d in data if d.get('type') == 'TV Show'])
        }
    except Exception as e:
        return {"error": f"Could not calculate stats: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    # Use the port Render provides, or default to 8000 for local testing
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)