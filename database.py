from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection URI (Local or Atlas)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Create a MongoDB client
try:
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.WebApp  # Name of our database
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    db = None

# Define collections (NoSQL equivalent of tables)
students_collection = db["students"] if db else None  # Stores student accounts
progress_collection = db["progress"] if db else None  # Tracks student progress
assignments_collection = db["assignments"] if db else None  # Stores submitted Excel files

