from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# 1. Setup CORS properly
# Add your local development URL and your production Vercel URL
origins = [
    "http://localhost:3000",
    "https://your-app-name.vercel.app", # <--- REPLACE WITH YOUR ACTUAL VERCEL URL
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
    # 1. Get the current working directory (where Render starts the app)
    cwd = os.getcwd()
    
    # 2. List of possible paths to check
    # Path 1: If we are already inside 'backend'
    # Path 2: If we need to look inside 'data' directly
    # Path 3: The absolute path Render's error was showing
    possible_paths = [
        os.path.join(cwd, 'data', 'processed', 'netflix_cleaned.json'),
        os.path.join(cwd, 'backend', 'data', 'processed', 'netflix_cleaned.json'),
        '/opt/render/project/src/backend/data/processed/netflix_cleaned.json'
    ]
    
    for path in possible_paths:
        print(f"DEBUG: Checking path: {path}") # This will show in your Render Logs
        if os.path.exists(path):
            print(f"DEBUG: Found file at: {path}!")
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)

    # 3. If none work, raise an error that lists EXACTLY what the folder looks like
    files_in_cwd = os.listdir(cwd)
    raise FileNotFoundError(
        f"Could not find JSON. Checked {possible_paths}. "
        f"CWD is {cwd}, which contains: {files_in_cwd}"
    )

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