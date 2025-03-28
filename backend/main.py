from fastapi import FastAPI, HTTPException
from backend.database import students_collection, progress_collection
from backend.models import Student, Progress
from bson import ObjectId

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import traceback

# Load .env
load_dotenv()

# Safe check for API key
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print("✅ Loaded OpenAI Key:", api_key[:10] + "...")
else:
    print("❌ OPENAI_API_KEY not found in environment variables!")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# Load AI prompts
file_path = os.path.join(os.path.dirname(__file__), "data", "ai_prompts.json")
with open(file_path, "r", encoding="utf-8") as f:
    SUBTOPIC_AI_PROMPTS = json.load(f)

# Init FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional health check
@app.get("/")
async def root():
    return {"status": "ok", "message": "FastAPI backend is running"}

# AI Chat Model
class ChatRequest(BaseModel):
    message: str
    topic_id: str = "general"
    history: list[dict] = []

# Add a new student
@app.post("/students/")
async def create_student(student: Student):
    existing = await students_collection.find_one({"email": student.email})
    if existing:
        raise HTTPException(status_code=400, detail="Student already exists")
    result = await students_collection.insert_one(student.dict())
    return {"message": "Student added", "student_id": str(result.inserted_id)}

# Get progress
@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    progress = await progress_collection.find_one({"student_id": student_id})
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

# Update progress
@app.post("/progress/")
async def update_progress(progress: Progress):
    await progress_collection.update_one(
        {"student_id": progress.student_id},
        {"$set": progress.dict()},
        upsert=True
    )
    return {"message": "Progress updated"}

# AI Chat Assistant
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        prompts = SUBTOPIC_AI_PROMPTS.get(request.topic_id, SUBTOPIC_AI_PROMPTS["general"])
        messages = [{"role": "system", "content": prompts["system"]}]

        if not request.history:
            messages.append({"role": "assistant", "content": prompts["initial"]})
        else:
            messages.extend(request.history)
            messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        reply = response.choices[0].message.content
        print("🤖 AI Reply:", reply)
        return {"reply": reply}

    except Exception as e:
        print("⚠️ Exception in /chat:")
        print(traceback.format_exc())
        return {"reply": f"⚠️ Error: {str(e)}"}
