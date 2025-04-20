import random

def generate_quiz():
    def to_gray(n):
        return n ^ (n >> 1)

    questions = []
    used = set()
    while len(questions) < 5:
        n = random.randint(0, 15)
        if n in used:
            continue
        used.add(n)
        gray = format(to_gray(n), '04b')
        questions.append({
            "type": "dec_to_gray",
            "question": f"What is the 4-bit Gray code for decimal {n}?",
            "correct_answer": gray
        })
    return questions