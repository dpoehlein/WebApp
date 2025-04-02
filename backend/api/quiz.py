# backend/api/quiz.py

from fastapi import APIRouter
from learning_objectives.digital_electronics.number_systems.binary_quiz import generate_binary_quiz

router = APIRouter()

@router.get("/quiz/binary")
async def get_binary_quiz():
    quiz = generate_binary_quiz()
    return {"quiz": quiz}
