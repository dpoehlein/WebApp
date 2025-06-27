from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Student(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    allowed: bool = True

class Progress(BaseModel):
    student_id: str
    topic: str
    subtopic: str
    nested_subtopic: str
    quiz_score: int = 0
    ai_score: int = 0
    assignment_score: int = 0
    activity_id: Optional[str] = None
    objective_progress: List[bool]

class AssignmentGrade(BaseModel):
    student_id: str
    topic_id: str
    subtopic_id: str
    score: float
    feedback: str
    timestamp: Optional[datetime] = None
