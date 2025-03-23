from pydantic import BaseModel
from typing import Dict

class Student(BaseModel):
    name: str
    email: str

class Progress(BaseModel):
    student_id: str
    topic: str
    subtopics: Dict[str, dict]
