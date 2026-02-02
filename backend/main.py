from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Enable CORS so your React app can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data")
def get_data():
    path = os.path.join('data', 'processed', 'netflix_cleaned.json')
    with open(path, 'r') as f:
        return json.load(f)

@app.get("/api/stats")
def get_stats():
    # Simple endpoint for dashboard "top-level" metrics
    path = os.path.join('data', 'processed', 'netflix_cleaned.json')
    with open(path, 'r') as f:
        data = json.load(f)
        return {
            "total_titles": len(data),
            "movies": len([d for d in data if d['type'] == 'Movie']),
            "tv_shows": len([d for d in data if d['type'] == 'TV Show'])
        }