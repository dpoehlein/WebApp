from fastapi import FastAPI, HTTPException, UploadFile, File, Request 
from backend.database import students_collection, progress_collection, assignment_grades_collection
from backend.models import Student, Progress
from backend import students
from bson import ObjectId

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI  # ✅ Correct for SDK v1.x
import os
import json
import traceback
from typing import List, Optional
import importlib.util
from datetime import datetime

# ✅ Load environment variables
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print("✅ Loaded OpenAI Key:", api_key[:10] + "...")
else:
    print("❌ OPENAI_API_KEY not found!")

# ✅ Initialize OpenAI client
client = OpenAI(api_key=api_key)

# ✅ Load AI prompts
file_path = os.path.join(os.path.dirname(__file__), "data", "ai_prompts.json")
with open(file_path, "r", encoding="utf-8") as f:
    SUBTOPIC_AI_PROMPTS = json.load(f)

# ✅ Init FastAPI
app = FastAPI()

# ✅ CORS setup
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

# ✅ Models
class ChatRequest(BaseModel):
    message: str
    topic_id: str = "general"
    subtopic_id: Optional[str] = None
    history: list[dict] = []
    objectives: Optional[List[str]] = []

# ✅ Student API
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

@app.get("/grades/{student_id}")
async def get_grades(student_id: str):
    grades = assignment_grades_collection.find({"student_id": student_id})
    results = []
    async for grade in grades:
        grade["_id"] = str(grade["_id"])
        results.append(grade)
    return results

# ✅ Chat evaluator loader
def load_objective_checker(topic_id: str, subtopic_id: Optional[str]):
    if not subtopic_id:
        return None
    path = f"backend/learning_objectives/{topic_id}/{subtopic_id}.py"
    abs_path = os.path.join(os.path.dirname(__file__), path)
    if not os.path.exists(abs_path):
        print(f"⚠️ No custom evaluator at {path}")
        return None
    try:
        spec = importlib.util.spec_from_file_location("objectives", abs_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return getattr(module, "get_objective_state", None)
    except Exception as e:
        print(f"❌ Error loading evaluator: {e}")
        return None

# ✅ AI Chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        prompts = SUBTOPIC_AI_PROMPTS.get(request.subtopic_id or request.topic_id, SUBTOPIC_AI_PROMPTS["general"])
        system_message = prompts["system"]

        if request.objectives:
            objectives_list = "\n".join([f"- {obj}" for obj in request.objectives])
            system_message += f"\n\nThe student is working toward:\n{objectives_list}"

        system_message += "\n\nImportant: Ask only ONE question at a time."

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
                    raw_flags = custom_checker(
                        request.history + [{"role": "user", "content": request.message}, {"role": "assistant", "content": reply}]
                    )
                    progress_flags = [
                        True if flag is True else "partial" if flag else False
                        for flag in raw_flags
                    ]
                except Exception as e:
                    print("⚠️ Objective checker error:", e)
                    progress_flags = [False] * len(request.objectives)
            else:
                eval_prompt = (
                    "You are a tutor AI. The student is trying to complete these objectives:\n"
                    + "\n".join([f"{i+1}. {obj}" for i, obj in enumerate(request.objectives)])
                    + "\n\nBased ONLY on the last exchange, evaluate their understanding.\nReturn a list like:\n[true, \"partial\", false]"
                )

                eval_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": eval_prompt},
                        {"role": "user", "content": request.message},
                        {"role": "assistant", "content": reply}
                    ],
                    temperature=0.0,
                    max_tokens=200
                )

                raw = eval_response.choices[0].message.content.strip()
                print("📊 Eval:", raw)

                try:
                    parsed = json.loads(raw.replace("'", '"'))
                    progress_flags = parsed if isinstance(parsed, list) else [False] * len(request.objectives)
                except Exception as e:
                    print("⚠️ Failed to parse eval:", e)
                    progress_flags = [False] * len(request.objectives)

        # ✅ Detect if all objectives are complete
        ready_prompt = None
        if progress_flags and all(p is True for p in progress_flags):
            ready_prompt = "✅ Awesome work! You've demonstrated a strong understanding of this topic. You can take the quiz to challenge yourself further, or just keep exploring other pages—I'll be here to help on your next topic!"

        return {
            "reply": reply,
            "progress": progress_flags,
            "ready_prompt": ready_prompt
        }

    except Exception as e:
        print("⚠️ Chat error:", traceback.format_exc())
        return {"reply": f"⚠️ Error: {str(e)}", "progress": [], "ready_prompt": None}

# ✅ Binary quiz endpoint
@app.get("/quiz/binary")
async def get_binary_quiz():
    try:
        from backend.quiz.binary_quiz import generate_binary_quiz
        return {"quiz": generate_binary_quiz()}
    except Exception as e:
        print("⚠️ Failed to generate quiz:", e)
        raise HTTPException(status_code=500, detail="Quiz generation error")

# ✅ Dynamic grading endpoint
@app.post("/grade/{topic_id}/{subtopic_id}")
async def dynamic_grader(
    topic_id: str,
    subtopic_id: str,
    file: UploadFile = File(...),
    request: Request = None
):
    try:
        contents = await file.read()
        rel_path = f"backend/graders/{topic_id}/{subtopic_id}.py"
        abs_path = os.path.join(os.path.dirname(__file__), rel_path)

        if not os.path.exists(abs_path):
            raise HTTPException(status_code=404, detail=f"No grader for {topic_id}/{subtopic_id}")

        spec = importlib.util.spec_from_file_location("grader", abs_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        if not hasattr(module, "grade"):
            raise HTTPException(status_code=500, detail=f"'grade' function missing in {topic_id}/{subtopic_id}.py")

        result = module.grade(contents)

        student_id = request.query_params.get("student_id")
        if student_id:
            await assignment_grades_collection.update_one(
                {
                    "student_id": student_id,
                    "topic_id": topic_id,
                    "subtopic_id": subtopic_id
                },
                {
                    "$set": {
                        "score": result["score"],
                        "feedback": result["feedback"],
                        "timestamp": datetime.utcnow()
                    }
                },
                upsert=True
            )

        return result

    except Exception as e:
        print("⚠️ Grading error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to grade assignment")

# ✅ Score update model for detailed subtopic progress
class ScoreUpdate(BaseModel):
    user_id: str
    topic: str
    subtopic: str
    nested_subtopic: str
    quiz_score: int = 0
    ai_score: int = 0
    assignment_score: int = 0
    activity_id: str = ""

# ✅ Insert or update per-subtopic score with upsert logic
@app.post("/save-progress")
async def save_nested_progress(data: ScoreUpdate):
    query = {
        "user_id": data.user_id,
        "topic": data.topic,
        "subtopic": data.subtopic,
        "nested_subtopic": data.nested_subtopic
    }

    existing = await progress_collection.find_one(query)

    if existing:
        updated = {
            "quiz_score": max(existing.get("quiz_score", 0), data.quiz_score),
            "ai_score": max(existing.get("ai_score", 0), data.ai_score),
            "assignment_score": max(existing.get("assignment_score", 0), data.assignment_score),
            "activity_id": data.activity_id,
            "updated_at": datetime.utcnow()
        }
        await progress_collection.update_one(query, {"$set": updated})
        return {"message": "Progress updated"}
    
    else:
        record = {
            **query,
            "quiz_score": data.quiz_score,
            "ai_score": data.ai_score,
            "assignment_score": data.assignment_score,
            "activity_id": data.activity_id,
            "updated_at": datetime.utcnow()
        }
        await progress_collection.insert_one(record)
        return {"message": "Progress created"}

app.include_router(students.router)

@app.get("/progress-all/{user_id}")
async def get_user_progress(user_id: str):
    results = []
    cursor = progress_collection.find({"user_id": user_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results