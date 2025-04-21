from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.database import students_collection

router = APIRouter()

# Pydantic model
class Student(BaseModel):
    user_id: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    allowed: bool = True

@router.get("/students", response_model=List[Student])
async def list_students():
    cursor = students_collection.find({})
    valid_students = []
    async for doc in cursor:
        if "user_id" in doc:
            try:
                valid_students.append(Student(**doc))
            except Exception as e:
                print(f"⚠️ Skipping malformed student document: {doc} — Error: {e}")
    return valid_students

@router.get("/students/{user_id}", response_model=Student)
async def get_student(user_id: str):
    student = await students_collection.find_one({"user_id": user_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return Student(**student)

@router.post("/students")
async def create_student(student: Student):
    existing = await students_collection.find_one({"user_id": student.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Student already exists")
    await students_collection.insert_one({**student.dict(), "created_at": datetime.utcnow()})
    return {"message": "Student added"}

@router.put("/students/{user_id}")
async def update_student(user_id: str, student: Student):
    result = await students_collection.update_one(
        {"user_id": user_id},
        {"$set": student.dict()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found or no update applied")
    return {"message": "Student updated"}

@router.delete("/students/{user_id}")
async def delete_student(user_id: str):
    result = await students_collection.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted"}