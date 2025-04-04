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
from typing import List, Optional
import importlib.util

# ✅ Load .env
load_dotenv()

# ✅ Safe check for API key
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print("✅ Loaded OpenAI Key:", api_key[:10] + "...")
else:
    print("❌ OPENAI_API_KEY not found in environment variables!")

# ✅ Initialize OpenAI client
client = OpenAI

# ✅ Load AI prompts
file_path = os.path.join(os.path.dirname(__file__), "data", "ai_prompts.json")
with open(file_path, "r", encoding="utf-8") as f:
    SUBTOPIC_AI_PROMPTS = json.load(f)

# ✅ Init FastAPI
app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Health check
@app.get("/")
async def root():
    return {"status": "ok", "message": "FastAPI backend is running"}

# ✅ Student management
@app.post("/students/")
async def create_student(student: Student):
    existing = await students_collection.find_one({"email": student.email})
    if existing:
        raise HTTPException(status_code=400, detail="Student already exists")
    result = await students_collection.insert_one(student.dict())
    return {"message": "Student added", "student_id": str(result.inserted_id)}

@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    progress = await progress_collection.find_one({"student_id": student_id})
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

@app.post("/progress/")
async def update_progress(progress: Progress):
    await progress_collection.update_one(
        {"student_id": progress.student_id},
        {"$set": progress.dict()},
        upsert=True
    )
    return {"message": "Progress updated"}

# ✅ AI Chat Structures
class ChatRequest(BaseModel):
    message: str
    topic_id: str = "general"
    subtopic_id: Optional[str] = None
    history: list[dict] = []
    objectives: Optional[List[str]] = []

# ✅ Load evaluator for objectives
def load_objective_checker(topic_id: str, subtopic_id: Optional[str]):
    if not subtopic_id:
        return None

    rel_path = f"backend/learning_objectives/{topic_id}/{subtopic_id}.py"
    abs_path = os.path.join(os.path.dirname(__file__), rel_path)

    if not os.path.exists(abs_path):
        print(f"⚠️ No custom evaluator found at {rel_path}")
        return None

    try:
        spec = importlib.util.spec_from_file_location("objectives", abs_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return getattr(module, "get_objective_state", None)
    except Exception as e:
        print(f"❌ Error loading evaluator from {rel_path}: {e}")
        return None

# ✅ AI Chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        prompts = SUBTOPIC_AI_PROMPTS.get(request.subtopic_id or request.topic_id, SUBTOPIC_AI_PROMPTS["general"])
        objectives_context = ""

        if request.objectives:
            objectives_list = "\n".join([f"- {obj}" for obj in request.objectives])
            objectives_context = (
                "The student is working toward the following learning objectives:\n"
                f"{objectives_list}\n"
                "Please tailor your response to help the student achieve one or more of these."
            )

        system_message = prompts["system"]
        if objectives_context:
            system_message += f"\n\n{objectives_context}"
        system_message += "\n\nImportant: Ask only ONE question at a time. Wait for the student to respond before asking another."

        messages = [{"role": "system", "content": system_message}]
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

        progress_flags = []
        if request.objectives:
            custom_checker = load_objective_checker(request.topic_id, request.subtopic_id)
            if custom_checker:
                try:
                    progress_flags = custom_checker(request.history + [{"role": "user", "content": request.message}, {"role": "assistant", "content": reply}])
                except Exception as e:
                    print("⚠️ Custom evaluator failed:", e)
                    progress_flags = [False] * len(request.objectives)
            else:
                eval_prompt = (
                    "You are a tutor AI. The student is trying to complete these objectives:\n"
                    + "\n".join([f"{i+1}. {obj}" for i, obj in enumerate(request.objectives)])
                    + "\n\nBased ONLY on the last exchange (user and your assistant reply), "
                    "evaluate whether the student showed understanding of each objective.\n"
                    "Return a list in this format:\n"
                    "[true, \"partial\", false, ...]"
                )

                eval_messages = [
                    {"role": "system", "content": eval_prompt},
                    {"role": "user", "content": request.message},
                    {"role": "assistant", "content": reply}
                ]

                eval_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=eval_messages,
                    temperature=0.0,
                    max_tokens=200
                )

                raw_progress = eval_response.choices[0].message.content.strip()
                print("📊 AI Progress Eval:", raw_progress)

                try:
                    parsed = json.loads(raw_progress.replace("'", '"'))
                    progress_flags = parsed if isinstance(parsed, list) else [False] * len(request.objectives)
                except Exception as e:
                    print("⚠️ JSON parsing failed:", e)
                    progress_flags = [False] * len(request.objectives)

        return {
            "reply": reply,
            "progress": progress_flags
        }

    except Exception as e:
        print("⚠️ Exception in /chat:")
        print(traceback.format_exc())
        return {"reply": f"⚠️ Error: {str(e)}", "progress": []}

# ✅ Binary Quiz API
@app.get("/quiz/binary")
async def get_binary_quiz():
    try:
        from backend.quiz.binary_quiz import generate_binary_quiz
        quiz = generate_binary_quiz()
        return {"quiz": quiz}
    except Exception as e:
        print("⚠️ Failed to generate quiz:", e)
        raise HTTPException(status_code=500, detail="Could not generate quiz")
