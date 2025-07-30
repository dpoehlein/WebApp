# ───── Standard Library ─────
import os
import json
import traceback
import importlib.util
from datetime import datetime
from typing import List, Optional, Union
from pathlib import Path

# ───── Third-Party Libraries ─────
from fastapi import APIRouter, FastAPI, HTTPException, UploadFile, File, Request, Query, Body 
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

# ───── Internal Modules (absolute from backend/) ─────
from backend.objective_loader import load_objective_checker
from backend.database import students_collection, progress_collection, assignment_grades_collection
from backend.models import Student, Progress

# ───── Load Environment Variables ─────
env_path = Path(__file__).resolve().parent / ".env"
if not env_path.exists():
    print(f"⚠️  .env file not found at {env_path}")
load_dotenv(dotenv_path=env_path)

# ───── OpenAI Client Setup ─────
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("❌ OPENAI_API_KEY not found in environment variables")

print("✅ Loaded OpenAI Key:", api_key[:10] + "...")
client = OpenAI(api_key=api_key)


# ───── Load AI Prompt File ─────
SUBTOPIC_AI_PROMPTS = {}
try:
    file_path = os.path.join(os.path.dirname(__file__), "data", "ai_prompts.json")
    with open(file_path, "r", encoding="utf-8") as f:
        SUBTOPIC_AI_PROMPTS = json.load(f)
    print("✅ Loaded ai_prompts.json")
except Exception as e:
    print(f"❌ Failed to load ai_prompts.json: {e}")

# ───── FastAPI App Setup ─────
app = FastAPI(default_response_class=JSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ───── Root Route for Health Check ─────
@app.get("/")
async def root():
    return {"status": "ok", "message": "FastAPI backend is running"}

# ───── Pydantic Model for Chat Endpoint ─────
class ChatRequest(BaseModel):
    student_id: str
    message: str
    topic_id: str = "general"
    subtopic_id: Optional[str] = None
    nested_subtopic_id: Optional[str] = None
    history: List[dict] = []
    objectives: Optional[List[str]] = []

@app.get("/students")
async def get_students():
    students = []
    async for doc in students_collection.find():
        doc["_id"] = str(doc["_id"])
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

@app.get("/students/{student_id}")
async def get_student(student_id: str):
    student = await students_collection.find_one({"user_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student["_id"] = str(student["_id"])  # Optional: remove ObjectId serialization issues
    return student

@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    progress = await progress_collection.find_one({"student_id": student_id})
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

@app.get("/get-progress")
async def get_progress(
    student_id: str,
    topic_id: str,
    subtopic_id: str,
    nested_subtopic_id: str,
):
    print("🟦 GET /get-progress query:", {
        "student_id": student_id,
        "topic_id": topic_id,
        "subtopic_id": subtopic_id,
        "nested_subtopic_id": nested_subtopic_id
    })

    progress = await progress_collection.find_one({
        "student_id": student_id,
        "topic_id": topic_id,
        "subtopic_id": subtopic_id,
        "nested_subtopic_id": nested_subtopic_id
    })

    if not progress:
        print("🔴 No progress found.")
        raise HTTPException(status_code=404, detail="Progress not found")

    def merge_objective_progress(ai_flags, quiz_flags):
        max_len = max(len(ai_flags), len(quiz_flags))
        ai_flags += [False] * (max_len - len(ai_flags))
        quiz_flags += [False] * (max_len - len(quiz_flags))
        return [a or q for a, q in zip(ai_flags, quiz_flags)]

    merged_flags = merge_objective_progress(
        progress.get("ai_objective_progress", []),
        progress.get("quiz_objective_progress", [])
    )

    topic_grade = max(progress.get("quiz_score", 0), progress.get("ai_score", 0))
    print("✅ Merged Objective Progress:", merged_flags)
    print("🏁 Topic Grade:", topic_grade)

    return {
        "objective_progress": merged_flags,
        "quiz_score": progress.get("quiz_score", 0),
        "ai_score": progress.get("ai_score", 0),
        "assignment_score": progress.get("assignment_score", 0),
        "topic_grade": topic_grade,
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

def load_objective_checker(topic_id: str, subtopic_id: Optional[str], nested_subtopic_id: Optional[str] = None):
    if nested_subtopic_id:
        nested_path = f"backend/learning_objectives/{topic_id}/{subtopic_id}/{nested_subtopic_id}.py"
        abs_nested_path = os.path.join(os.path.dirname(__file__), nested_path)
        if os.path.exists(abs_nested_path):
            try:
                spec = importlib.util.spec_from_file_location("objectives", abs_nested_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                return getattr(module, "get_objective_state", None)
            except Exception as e:
                print(f"❌ Error loading nested objective checker: {e}")

    # fallback
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
        # ---- Prompt Setup ----
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

        # ---- GPT Response ----
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        reply = response.choices[0].message.content.strip()
        print("🤖 AI Reply:", reply)

        # ---- Evaluate Progress ----
        progress_flags = []
        chat_with_latest = request.history + [
            {"role": "user", "content": request.message},
            {"role": "assistant", "content": reply}
        ]

        get_objective_state = load_objective_checker(
            topic_id=request.topic_id,
            subtopic_id=request.subtopic_id,
            nested_subtopic_id=request.nested_subtopic_id
        )

        if get_objective_state:
            progress_flags = get_objective_state(chat_with_latest)
        else:
            print(f"⚠️ No objective checker found for {request.topic_id}/{request.subtopic_id}")
            progress_flags = []

        # ---- Load Stored Progress (to preserve prior wins) ----
        stored_progress = []
        try:
            existing = await progress_collection.find_one({
                "student_id": request.student_id,
                "topic_id": request.topic_id,
                "subtopic_id": request.subtopic_id,
                "nested_subtopic_id": request.nested_subtopic_id
            })
            if existing:
                stored_progress = existing.get("objective_progress", [])
        except Exception as e:
            print(f"⚠️ Failed to fetch stored progress: {e}")

        # ---- Merge Old and New ----
        if stored_progress and len(stored_progress) == len(progress_flags):
            merged_progress = []
            for new, old in zip(progress_flags, stored_progress):
                if old is True:
                    merged_progress.append(True)
                elif new is True:
                    merged_progress.append(True)
                elif new == "progress" or old == "progress":
                    merged_progress.append("progress")
                else:
                    merged_progress.append(False)
            progress_flags = merged_progress
        else:
            print(f"⚠️ Flag length mismatch — stored: {len(stored_progress)}, new: {len(progress_flags)}")

        # ---- AI Score Calculation ----
        def calculate_ai_score(flags):
            total = len(flags)
            earned = sum(1 if f is True else 0.5 if f == "progress" else 0 for f in flags)
            return round((earned / total) * 100) if total else 0

        ai_score = calculate_ai_score(progress_flags)

        print("📬 Final Progress Flags:", progress_flags)
        print("📈 Final AI Score:", ai_score)

        # ---- Optional: Completion Message ----
        ready_prompt = None
        if progress_flags and all(p is True for p in progress_flags):
            ready_prompt = (
                "✅ Awesome work! You've demonstrated a strong understanding of this topic. "
                "You can take the quiz to challenge yourself further, or just keep exploring other pages—"
                "I'll be here to help on your next topic!"
            )

        # ---- Save to MongoDB ----
        save_payload = SaveProgressRequest(
            student_id=request.student_id,
            topic_id=request.topic_id,
            subtopic_id=request.subtopic_id,
            nested_subtopic_id=request.nested_subtopic_id,
            ai_score=ai_score,
            ai_objective_progress=progress_flags
        )
        await save_progress(save_payload)

        print("🧠 Returning AI progress flags from /chat:", progress_flags)

        # ---- Response ----
        return {
            "reply": reply,
            "progress": progress_flags,
            "ai_score": ai_score,
            "topic_grade": max(ai_score, existing.get("quiz_score", 0) if existing else 0),
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

class PracticeProblemRequest(BaseModel):
    objective: str

@app.post("/generate-practice-problem")
async def generate_practice_problem(req: PracticeProblemRequest):
    prompt = f"Generate a single, clear, age-appropriate practice problem to help a student practice this skill: {req.objective}. Only return one practice problem. Do not include explanations or a list."

    try:
        response = client.chat.completions.create(  # 🛠 No await here
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful tutor that gives short, direct practice problems."},
                {"role": "user", "content": prompt},
            ]
        )
        return {"problem": response.choices[0].message.content}
    except Exception as e:
        print("❌ Practice problem generation failed:", e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate practice problem")

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
    topic_id: str
    subtopic_id: str
    nested_subtopic_id: str
    quiz_score: int = 0
    ai_score: int = 0
    assignment_score: int = 0
    activity_id: str = ""
    objective_progress: Optional[List[Union[bool, str]]]=[]

class SaveProgressRequest(BaseModel):
    student_id: str
    topic_id: str
    subtopic_id: str
    nested_subtopic_id: str
    quiz_score: Optional[int] = None
    ai_score: Optional[int] = None
    assignment_score: Optional[int] = 0
    activity_id: Optional[str] = None
    quiz_objective_progress: Optional[List[Union[bool, str]]] = []
    ai_objective_progress: Optional[List[Union[bool, str]]] = []

@app.post("/save-progress")
async def save_progress(payload: SaveProgressRequest):
    query = {
        "student_id": payload.student_id,
        "topic_id": payload.topic_id,
        "subtopic_id": payload.subtopic_id,
        "nested_subtopic_id": payload.nested_subtopic_id,
    }

    # Fetch existing progress record (if any)
    existing = await progress_collection.find_one(query)

    # Extract existing values or use defaults
    existing_ai = existing.get("ai_objective_progress", []) if existing else []
    existing_quiz = existing.get("quiz_objective_progress", []) if existing else []

    # Use payload values if provided, otherwise fall back to existing
    new_ai = payload.ai_objective_progress or existing_ai
    new_quiz = payload.quiz_objective_progress or existing_quiz

    # Ensure both lists are the same length
    max_len = max(len(new_ai), len(new_quiz))
    padded_ai = new_ai + [False] * (max_len - len(new_ai))
    padded_quiz = new_quiz + [False] * (max_len - len(new_quiz))
    merged_flags = [a or q for a, q in zip(padded_ai, padded_quiz)]

    # Scores (fallbacks if None or not in payload)
    quiz_score = payload.quiz_score if payload.quiz_score is not None else (existing.get("quiz_score", 0) if existing else 0)
    ai_score = payload.ai_score if payload.ai_score is not None else (existing.get("ai_score", 0) if existing else 0)
    assignment_score = payload.assignment_score if payload.assignment_score is not None else (existing.get("assignment_score", 0) if existing else 0)
    topic_grade = max(quiz_score, ai_score)

    update_doc = {
        "$set": {
            "student_id": payload.student_id,
            "topic_id": payload.topic_id,
            "subtopic_id": payload.subtopic_id,
            "nested_subtopic_id": payload.nested_subtopic_id,
            "quiz_score": quiz_score,
            "ai_score": ai_score,
            "assignment_score": assignment_score,
            "topic_grade": topic_grade,
            "activity_id": payload.activity_id if payload.activity_id is not None else (existing.get("activity_id") if existing else None),
            "quiz_objective_progress": new_quiz,
            "ai_objective_progress": new_ai,
            "objective_progress": merged_flags,
            "updated_at": datetime.utcnow(),
        }
    }

    await progress_collection.update_one(query, update_doc, upsert=True)

    return JSONResponse(content={
        "message": "Progress saved successfully.",
        "topic_grade": topic_grade,
        "objective_progress": merged_flags
    })

@app.get("/progress-all/{student_id}")
async def get_user_progress(student_id: str):
    results = []
    cursor = progress_collection.find({"student_id": student_id})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@app.put("/reset-scores/{student_id}/{topic_id}/{subtopic_id}/{nested_subtopic_id}")
async def reset_scores(student_id: str, topic_id: str, subtopic_id: str, nested_subtopic_id: str):
    result = await progress_collection.update_one(
        {
            "student_id": student_id,
            "topic_id": topic_id,
            "subtopic_id": subtopic_id,
            "nested_subtopic_id": nested_subtopic_id
        },
        {
            "$set": {
                "ai_score": 0,
                "quiz_score": 0,
                "topic_grade": 0
            }
        }
    )
    return {"message": "Scores reset", "matched": result.matched_count, "modified": result.modified_count}

