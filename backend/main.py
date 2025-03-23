from fastapi import FastAPI, HTTPException
from backend.database import students_collection, progress_collection
from backend.models import Student, Progress
from bson import ObjectId

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

# Load environment variables (e.g., OpenAI API key)
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path)
print("✅ Loaded OpenAI Key:", os.getenv("OPENAI_API_KEY")[:10] + "...")

# Initialize OpenAI client (pass key explicitly)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load topic-specific AI prompts from file
file_path = os.path.join(os.path.dirname(__file__), "data", "ai_prompts.json")
with open(file_path, "r", encoding="utf-8") as f:
    SUBTOPIC_AI_PROMPTS = json.load(f)

# Initialize FastAPI app
app = FastAPI()

# Allow requests from frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model for NestedSubtopicPage AI Assistant
class ChatRequest(BaseModel):
    message: str
    topic_id: str = "general"  # e.g., "binary"
    history: list[dict] = []   # List of previous messages: [{"role": "user", "content": "..."}]


# Add a new student
@app.post("/students/")
async def create_student(student: Student):
    existing_student = await students_collection.find_one({"email": student.email})
    if existing_student:
        raise HTTPException(status_code=400, detail="Student already exists")

    result = await students_collection.insert_one(student.dict())
    return {"message": "Student added", "student_id": str(result.inserted_id)}

# Get student progress
@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    progress = await progress_collection.find_one({"student_id": student_id})
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

# Update student progress
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
        # Get topic-specific system + initial messages
        ai_prompts = SUBTOPIC_AI_PROMPTS.get(request.topic_id, SUBTOPIC_AI_PROMPTS["general"])
        messages = [{"role": "system", "content": ai_prompts["system"]}]

        # If no history, preload initial assistant greeting
        if not request.history:
            messages.append({"role": "assistant", "content": ai_prompts["initial"]})
        else:
            messages.extend(request.history)
            messages.append({"role": "user", "content": request.message})

        # Send to OpenAI
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        return {"reply": response.choices[0].message.content}
    
    except Exception as e:
        import traceback
        print("⚠️ Exception occurred in /chat endpoint:")
        print(traceback.format_exc())
        return {"reply": f"⚠️ Error: {str(e)}"}

