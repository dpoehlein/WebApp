# ───── Standard Library ─────
import os
import json
import traceback
import importlib.util
from datetime import datetime
from typing import List, Optional, Union

# ───── Third-Party Libraries ─────
from fastapi import APIRouter, FastAPI, HTTPException, UploadFile, File, Request, Query, Body 
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

# ───── Internal Modules ─────
from backend.database import students_collection, progress_collection, assignment_grades_collection
from backend.models import Student, Progress

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print("✅ Loaded OpenAI Key:", api_key[:10] + "...")
else:
    print("❌ OPENAI_API_KEY not found!")

client = OpenAI(api_key=api_key, http_client=None)

file_path = os.path.join(os.path.dirname(__file__), "data", "ai_prompts.json")
with open(file_path, "r", encoding="utf-8") as f:
    SUBTOPIC_AI_PROMPTS = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "FastAPI backend is running"}

class ChatRequest(BaseModel):
    student_id: str
    message: str
    topic_id: str = "general"
    subtopic_id: Optional[str] = None
    nested_subtopic_id: Optional[str] = None
    history: list[dict] = []
    objectives: Optional[List[str]] = []

@app.get("/students")
async def get_students():
    students = []
    async for doc in students_collection.find():
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string for JSON
        students.append(doc)
    return students

@app.put("/students/{student_id}")
async def update_student_allowed(student_id: str, updated_data: dict):
    result = await students_collection.update_one(
        {"user_id": student_id},
        {"$set": {"allowed": updated_data.get("allowed", False)}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found or no change made.")
    return {"message": "Student updated"}

@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    progress = await progress_collection.find_one({"student_id": student_id})
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

@app.get("/get-progress")
async def get_nested_progress(
    student_id: str = Query(...),
    topic_id: str = Query(...),
    subtopic_id: str = Query(...),
    nested_subtopic_id: str = Query(...)
):
    query = {
        "student_id": student_id,
        "topic": topic_id,
        "subtopic": subtopic_id,
        "nested_subtopic": nested_subtopic_id
    }
    print(f"🟦 GET /get-progress query: {query}")

    progress = await progress_collection.find_one(query)
    if not progress:
        print("🔴 No progress found.")
        raise HTTPException(status_code=404, detail="Progress not found")

    # Ensure safe default values
    quiz_score = progress.get("quiz_score", 0)
    ai_score = progress.get("ai_score", 0)
    quiz_flags = progress.get("quiz_objective_progress", [])
    ai_flags = progress.get("ai_objective_progress", [])
    assignment_score = progress.get("assignment_score", 0)

    # Merge objective flags
    merged_flags = [
        q or a for q, a in zip(
            quiz_flags + [False] * max(0, len(ai_flags) - len(quiz_flags)),
            ai_flags + [False] * max(0, len(quiz_flags) - len(ai_flags))
        )
    ]

    # Topic grade = best of quiz or AI score
    topic_grade = max(quiz_score, ai_score)

    print(f"✅ Merged Objective Progress: {merged_flags}")
    print(f"🏁 Topic Grade: {topic_grade}")

    return {
        "student_id": progress.get("student_id"),
        "topic": progress.get("topic"),
        "subtopic": progress.get("subtopic"),
        "nested_subtopic": progress.get("nested_subtopic"),
        "quiz_score": quiz_score,
        "ai_score": ai_score,
        "assignment_score": assignment_score,
        "activity_id": progress.get("activity_id"),
        "objective_progress": merged_flags,
        "topic_grade": topic_grade,
        "updated_at": progress.get("updated_at", datetime.utcnow())
    }

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
    
def load_nested_chat_evaluator(topic_id: str, subtopic_id: str):
    try:
        module_path = f"backend/graders/{topic_id}/chat_ai/{subtopic_id}_chat.py"
        abs_path = os.path.join(os.path.dirname(__file__), module_path)
        if not os.path.exists(abs_path):
            print(f"❌ Evaluator file not found: {module_path}")
            return None, {}

        spec = importlib.util.spec_from_file_location("chat_ai", abs_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        evaluator = getattr(module, "evaluate_chat", None)
        objectives = getattr(module, "NESTED_OBJECTIVES", {})
        return evaluator, objectives

    except Exception as e:
        print(f"❌ Failed to load evaluator: {e}")
        return None, {}

@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"📥 Received chat request: topic_id={request.topic_id}, subtopic_id={request.subtopic_id}, nested_subtopic_id={request.nested_subtopic_id}")
    print(f"📝 Chat message: {request.message}")

    try:
        prompts = SUBTOPIC_AI_PROMPTS.get(
            request.subtopic_id or request.topic_id,
            SUBTOPIC_AI_PROMPTS["general"]
        )
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

        # ---- GPT RESPONSE ----
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        reply = response.choices[0].message.content.strip()
        print("🤖 AI Reply:", reply)

        # ---- Evaluate Objectives ----
        progress_flags = []
        chat_with_latest = request.history + [
            {"role": "user", "content": request.message},
            {"role": "assistant", "content": reply}
        ]

        get_objective_state = load_objective_checker(
            topic_id=request.topic_id,
            subtopic_id=request.subtopic_id
        )

        if get_objective_state:
            progress_flags = get_objective_state(chat_with_latest)
        else:
            print(f"⚠️ No objective checker found for {request.topic_id}/{request.subtopic_id}")
            progress_flags = []

        # ---- Load stored progress to prevent regression ----
        stored_progress = []
        try:
            existing = await progress_collection.find_one({
                "student_id": request.student_id,
                "topic": request.topic_id,
                "subtopic": request.subtopic_id,
                "nested_subtopic": request.nested_subtopic_id
            })
            if existing:
                stored_progress = existing.get("objective_progress", [])
        except Exception as e:
            print(f"⚠️ Failed to fetch stored progress: {e}")

        # ---- Merge with existing progress ----
        if stored_progress and len(stored_progress) == len(progress_flags):
            progress_flags = [
                new or old for new, old in zip(progress_flags, stored_progress)
            ]
        else:
            print(f"⚠️ Flag length mismatch — stored: {len(stored_progress)}, new: {len(progress_flags)}")

        # ---- Ready message ----
        ready_prompt = None
        if progress_flags and all(p is True for p in progress_flags):
            ready_prompt = (
                "✅ Awesome work! You've demonstrated a strong understanding of this topic. "
                "You can take the quiz to challenge yourself further, or just keep exploring other pages—"
                "I'll be here to help on your next topic!"
            )

        print("📬 Final Progress Flags:", progress_flags)

        save_payload = SaveProgressRequest(
            student_id=request.student_id,
            topic=request.topic_id,
            subtopic=request.subtopic_id,
            nested_subtopic=request.nested_subtopic_id,
            ai_score=100 if all(p is True for p in progress_flags) else 0,
            ai_objective_progress=progress_flags
        )
        await save_progress(save_payload)

        return {
            "reply": reply,
            "progress": progress_flags,
            "ready_prompt": ready_prompt
        }

    except Exception as e:
        print("⚠️ Chat error:", traceback.format_exc())
        return {
            "reply": f"⚠️ Error: {str(e)}",
            "progress": [],
            "ready_prompt": None
        }

@app.get("/quiz/binary")
async def get_binary_quiz():
    try:
        from backend.quiz.binary_quiz import generate_binary_quiz
        return {"quiz": generate_binary_quiz()}
    except Exception as e:
        print("⚠️ Failed to generate quiz:", e)
        raise HTTPException(status_code=500, detail="Quiz generation error")

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

class ScoreUpdate(BaseModel):
    student_id: str
    topic: str
    subtopic: str
    nested_subtopic: str
    quiz_score: int = 0
    ai_score: int = 0
    assignment_score: int = 0
    activity_id: str = ""
    objective_progress: Optional[List[Union[bool, str]]]=[]

class SaveProgressRequest(BaseModel):
    student_id: str
    topic: str
    subtopic: str
    nested_subtopic: str
    quiz_score: Optional[int] = None
    ai_score: Optional[int] = None
    quiz_objective_progress: Optional[List[bool]] = None
    ai_objective_progress: Optional[List[bool]] = None

@app.post("/save-progress")
async def save_progress(payload: SaveProgressRequest):
    query = {
        "student_id": payload.student_id,
        "topic": payload.topic,
        "subtopic": payload.subtopic,
        "nested_subtopic": payload.nested_subtopic,
    }

    # Fetch existing progress record
    existing = await progress_collection.find_one(query)

    # Fallbacks
    existing_ai = existing.get("ai_objective_progress", []) if existing else []
    existing_quiz = existing.get("quiz_objective_progress", []) if existing else []

    # Update each field
    new_ai = payload.ai_objective_progress or existing_ai
    new_quiz = payload.quiz_objective_progress or existing_quiz

    # Merge objective progress flags
    max_len = max(len(new_ai), len(new_quiz))
    padded_ai = new_ai + [False] * (max_len - len(new_ai))
    padded_quiz = new_quiz + [False] * (max_len - len(new_quiz))
    merged_flags = [a or q for a, q in zip(padded_ai, padded_quiz)]

    # Merge scores
    quiz_score = payload.quiz_score if payload.quiz_score is not None else (existing.get("quiz_score", 0) if existing else 0)
    ai_score = payload.ai_score if payload.ai_score is not None else (existing.get("ai_score", 0) if existing else 0)
    topic_grade = max(quiz_score, ai_score)

    update_doc = {
        "$set": {
            "student_id": payload.student_id,
            "topic": payload.topic,
            "subtopic": payload.subtopic,
            "nested_subtopic": payload.nested_subtopic,
            "quiz_score": quiz_score,
            "ai_score": ai_score,
            "topic_grade": topic_grade,
            "quiz_objective_progress": new_quiz,
            "ai_objective_progress": new_ai,
            "objective_progress": merged_flags,
            "updated_at": datetime.utcnow(),
        }
    }

    await progress_collection.update_one(query, update_doc, upsert=True)

    return JSONResponse(content={"message": "Progress saved successfully."})

@app.get("/progress-all/{student_id}")
async def get_user_progress(student_id: str):
    results = []
    cursor = progress_collection.find({"student_id": student_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

from backend import students  # Ensure import
app.include_router(students.router)
