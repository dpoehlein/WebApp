# binary.py — learning objectives evaluation for Binary Numbers

def evaluate_objectives(chat_history):
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
    if any(kw in chat_text for kw in ["binary to decimal", "1010 is 10", "convert 1101", "binary number is equal to"]):
        flags.append(True)
    elif "binary" in chat_text and "decimal" in chat_text:
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 2: Convert decimal to binary
    if any(kw in chat_text for kw in ["decimal to binary", "convert 10", "13 in binary is", "in binary form"]):
        flags.append(True)
    elif "decimal" in chat_text and "binary" in chat_text:
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 3: Identify bit, nibble, and byte
    if any(kw in chat_text for kw in ["bit is", "nibble is", "byte is", "4 bits", "8 bits"]):
        flags.append(True)
    elif "bit" in chat_text or "nibble" in chat_text or "byte" in chat_text:
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
    if "digital signal" in chat_text and "binary" in chat_text:
        flags.append(True)
    elif "on or off" in chat_text or "1 and 0" in chat_text:
        flags.append("progress")
    else:
        flags.append(False)

    # Objective 6: Explain the importance of place value in binary
    if "place value" in chat_text and "binary" in chat_text:
        flags.append(True)
    elif "2^" in chat_text or "powers of 2" in chat_text:
        flags.append("progress")
    else:
        flags.append(False)

    return flags
