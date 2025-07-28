# migrate_progress_fields.py

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()  # Make sure .env is in backend folder

MONGO_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["WebApp"]
collection = db["progress"]

async def migrate():
    async for doc in collection.find({ "topic": { "$exists": True } }):
        update_fields = {}

        if "topic" in doc:
            update_fields["topic_id"] = doc["topic"]
        if "subtopic" in doc:
            update_fields["subtopic_id"] = doc["subtopic"]
        if "nested_subtopic" in doc:
            update_fields["nested_subtopic_id"] = doc["nested_subtopic"]

        # Perform the update
        await collection.update_one(
            { "_id": doc["_id"] },
            {
                "$set": update_fields,
                "$unset": {
                    "topic": "",
                    "subtopic": "",
                    "nested_subtopic": ""
                }
            }
        )

    print("✅ Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
