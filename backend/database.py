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
students_collection = db["students"] if db is not None else None  # Stores student accounts
progress_collection = db["progress"] if db is not None else None  # Tracks student progress
assignments_collection = db["assignments"] if db is not None else None  # Stores uploaded Excel files
assignment_grades_collection = db["assignment_grades"] if db is not None else None  # ✅ Graded scores & feedback

