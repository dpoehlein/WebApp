from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class Student(BaseModel):
    user_id: str
    name: str
    email: str

class Progress(BaseModel):
    student_id: str
    topic: str
    subtopics: Dict[str, dict]

class AssignmentGrade(BaseModel):
    student_id: str
    topic_id: str
    subtopic_id: str
    score: float
    feedback: str
    timestamp: Optional[datetime] = None
