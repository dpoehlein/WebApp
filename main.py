from fastapi import FastAPI, HTTPException
from database import students_collection, progress_collection
from models import Student, Progress
from bson import ObjectId

app = FastAPI()

# ✅ Add a new student
@app.post("/students/")
async def create_student(student: Student):
    existing_student = await students_collection.find_one({"email": student.email})
    if existing_student:
        raise HTTPException(status_code=400, detail="Student already exists")
    
    student_data = student.dict()
    result = await students_collection.insert_one(student_data)
    return {"message": "Student added", "student_id": str(result.inserted_id)}

# ✅ Get student progress
@app.get("/progress/{student_id}")
async def get_progress(student_id: str):
    progress = await progress_collection.find_one({"student_id": student_id})
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

# ✅ Update progress
@app.post("/progress/")
async def update_progress(progress: Progress):
    await progress_collection.update_one(
        {"student_id": progress.student_id},
        {"$set": progress.dict()},
        upsert=True
    )
    return {"message": "Progress updated"}
