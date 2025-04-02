import random

def generate_decimal_to_binary_question():
    decimal = random.randint(0, 255)
    correct_answer = format(decimal, '08b')
    return {
        "type": "dec_to_bin",
        "question": f"What is the 8-bit binary representation of the decimal number {decimal}?",
        "answer": correct_answer,
        "decimal": decimal
    }

def generate_binary_to_decimal_question():
    decimal = random.randint(0, 255)
    binary = format(decimal, '08b')
    return {
        "type": "bin_to_dec",
        "question": f"What is the decimal value of the binary number {binary}?",
        "answer": str(decimal),
        "binary": binary
    }

def generate_definition_question():
    questions = [
        {
            "type": "definition",
            "question": "What is a bit?",
            "answer": "The smallest unit of data in computing, either 0 or 1."
        },
        {
            "type": "definition",
            "question": "How many bits are in a nibble?",
            "answer": "4"
        },
        {
            "type": "definition",
            "question": "How many bits are in a byte?",
            "answer": "8"
        }
    ]
    return random.sample(questions, 3)  # Return all 3 in randomized order

def generate_binary_quiz():
    quiz = []
    quiz += [generate_decimal_to_binary_question() for _ in range(5)]
    quiz += [generate_binary_to_decimal_question() for _ in range(5)]
    quiz += generate_definition_question()
    random.shuffle(quiz)
    return quiz
