import random

def generate_quiz():
    questions = []
    used = set()
    while len(questions) < 5:
        dec = random.randint(8, 63)
        if dec in used:
            continue
        used.add(dec)
        oct_val = oct(dec)[2:]
        questions.append({
            "type": "dec_to_oct",
            "question": f"What is the octal representation of decimal {dec}?",
            "correct_answer": oct_val
        })
    return questions