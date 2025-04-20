import random

def generate_quiz():
    questions = []
    used = set()
    while len(questions) < 5:
        dec = random.randint(16, 255)
        if dec in used:
            continue
        used.add(dec)
        hex_val = hex(dec)[2:].upper()
        questions.append({
            "type": "dec_to_hex",
            "question": f"What is the hexadecimal representation of decimal {dec}?",
            "correct_answer": hex_val
        })
    return questions