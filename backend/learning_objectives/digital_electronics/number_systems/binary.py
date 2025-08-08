# binary.py — learning objectives evaluation for Binary Numbers

import re

def evaluate_objectives(message, chat_history):
    """
    Evaluates chat history to determine student progress toward binary learning objectives.
    Returns a list of flags: True (Completed), "progress" (Making Progress), False (Needs Work).
    """

    objectives = [
        "Convert binary to decimal",
        "Convert decimal to binary",
        "Identify bit, nibble, and byte",
        "Differentiate LSB and MSB",
        "Understand how binary represents digital signals",
        "Explain the importance of place value in binary"
    ]

    chat_text = " ".join(msg["content"].lower() for msg in chat_history if msg["role"] in ("user", "assistant"))

    flags = []

    # Objective 1: Convert binary to decimal
    bin_to_dec_matches = re.findall(r"\b(0b)?[01]{1,8}\b.*?\b(=|is|equals?)\b.*?\b\d+\b", chat_text)
    if len(bin_to_dec_matches) >= 2:
        flags.append(True)
    elif "binary to decimal" in chat_text or ("binary" in chat_text and "decimal" in chat_text):
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 2: Convert decimal to binary — requires both 4-bit and 8-bit conversions
    dec_to_bin_matches = re.findall(r"\b\d+\b.*?\b(=|is|equals?)\b.*?\b(0b)?[01]{1,8}\b", chat_text)

    has_4bit = False
    has_8bit = False
    for match in dec_to_bin_matches:
        numbers = re.findall(r'\d+', match[0])
        if not numbers:
            continue
        decimal_value = int(numbers[0])
        if decimal_value < 16:
            has_4bit = True
        elif decimal_value >= 16:
            has_8bit = True

    if has_4bit and has_8bit:
        flags.append(True)
    elif has_4bit or has_8bit or "decimal to binary" in chat_text:
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 3: Identify bit, nibble, and byte
    if any(kw in chat_text for kw in ["bit is", "nibble is", "byte is", "4 bits", "8 bits", "group of 4", "group of 8"]):
        flags.append(True)
    elif any(kw in chat_text for kw in ["bit", "nibble", "byte"]):
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 4: Differentiate LSB and MSB
    if "lsb" in chat_text and "msb" in chat_text:
        flags.append(True)
    elif "lsb" in chat_text or "msb" in chat_text:
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 5: Understand how binary represents digital signals
    if "binary" in chat_text and "digital signal" in chat_text:
        flags.append(True)
    elif any(kw in chat_text for kw in ["on or off", "1 and 0", "high or low", "binary signal"]):
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 6: Explain the importance of place value in binary
    if "place value" in chat_text and "binary" in chat_text:
        flags.append(True)
    elif any(kw in chat_text for kw in ["2^", "powers of 2", "128", "64", "32", "16", "8", "4", "2", "1"]):
        flags.append("progress")
    else:
        flags.append(False)

    return flags
