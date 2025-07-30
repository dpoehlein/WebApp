# run_backend.py
import os
from dotenv import load_dotenv
import uvicorn

# ✅ Load the backend .env file before FastAPI starts
load_dotenv(dotenv_path="./backend/.env")

if __name__ == "__main__":
    # ✅ Launch Uvicorn with reload
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
