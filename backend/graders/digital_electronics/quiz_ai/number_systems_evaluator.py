def evaluate_number_systems(chat_history):
    progress = {
        "binary_conversion_binary_to_decimal": False,
        "binary_conversion_decimal_to_binary": False,
        "binary_structure_understanding": False,
        "octal_conversion": False,
        "hexadecimal_conversion": False,
        "bcd_conversion": False,
        "gray_code_conversion": False
    }

    def update_progress(key):
        progress[key] = True

    for item in chat_history:
        if not isinstance(item, dict):
            continue

        qtype = item.get("type", "")
        student = item.get("student_answer", "").strip()
        correct = item.get("correct_answer", "").strip()

        # Binary
        if qtype == "bin_to_dec" and student == correct:
            update_progress("binary_conversion_binary_to_decimal")
        elif qtype == "dec_to_bin" and student == correct:
            update_progress("binary_conversion_decimal_to_binary")
        elif qtype == "definition" and student == correct:
            update_progress("binary_structure_understanding")

        # Octal
        elif qtype == "dec_to_oct" and student == correct:
            update_progress("octal_conversion")

        # Hexadecimal
        elif qtype == "dec_to_hex" and student.upper() == correct.upper():
            update_progress("hexadecimal_conversion")

        # BCD
        elif qtype == "dec_to_bcd" and student == correct:
            update_progress("bcd_conversion")

        # Gray Code
        elif qtype == "dec_to_gray" and student == correct:
            update_progress("gray_code_conversion")

    return progress