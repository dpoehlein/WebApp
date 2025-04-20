import random

def generate_quiz():
    def to_bcd(n):
        return ' '.join(f"{int(d):04b}" for d in str(n))
    
    questions = []
    used = set()
    while len(questions) < 5:
        dec = random.randint(0, 99)
        if dec in used:
            continue
        used.add(dec)
        bcd = to_bcd(dec)
        questions.append({
            "type": "dec_to_bcd",
            "question": f"What is the BCD representation of {dec}?",
            "correct_answer": bcd
        })
    return questions