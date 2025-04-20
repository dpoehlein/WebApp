import re
from collections import defaultdict

# ✅ Learning objectives by subtopic
objective_sets = {
    "binary": [
        {"id": "binary_base2", "description": "Understand that binary uses only 0 and 1", "min_successes": 1},
        {"id": "dec_to_bin", "description": "Convert decimal to binary", "min_successes": 2},
        {"id": "bin_to_dec", "description": "Convert binary to decimal", "min_successes": 2},
        {"id": "lsb_msb_order", "description": "Explain LSB and MSB", "min_successes": 1},
        {"id": "bit_nibble_byte", "description": "Identify bit, nibble, byte", "min_successes": 1},
        {"id": "binary_math", "description": "Perform binary addition", "min_successes": 1},
        {"id": "binary_usage", "description": "Explain binary's real-world use", "min_successes": 1}
    ],
    # Other subtopics...
}

# ✅ Match patterns (regex or string) per objective
keywords = {
    "binary_base2": ["only 0 and 1", "base-2", "uses digits 0 and 1"],
    "dec_to_bin": [r"\b(\d{1,3})\b\s*(in binary|to binary|=|equals)\s*0[01]{4,8}"],
    "bin_to_dec": [r"0[01]{4,8}\s*(=|is|means)\s*\d{1,3}"],
    "lsb_msb_order": ["least significant", "most significant", "lsb", "msb", "rightmost", "leftmost"],
    "bit_nibble_byte": ["bit", "nibble", "byte", "4-bit", "8-bit"],
    "binary_math": [r"[01]+\s*\+\s*[01]+", "binary addition", "add binary"],
    "binary_usage": ["used in computers", "digital logic", "data encoding", "real-world", "storage", "memory"]
    # Other subtopic keywords...
}

def get_objective_state(history):
    user_text = " ".join(msg["content"].lower() for msg in history if msg["role"] == "user")
    counter = defaultdict(int)
    result_flags = []

    # Infer subtopic from text or default to 'binary'
    active_subtopic = "binary"
    for key in objective_sets:
        if key in user_text:
            active_subtopic = key
            break

    objectives = objective_sets[active_subtopic]

    for obj in objectives:
        obj_id = obj["id"]
        min_hits = obj["min_successes"]
        matches = 0
        for pattern in keywords.get(obj_id, []):
            if isinstance(pattern, str):
                if pattern.lower() in user_text:
                    matches += 1
            else:
                if re.search(pattern, user_text):
                    matches += 1

        if matches >= min_hits:
            result_flags.append(True)
        elif matches > 0:
            result_flags.append("partial")
        else:
            result_flags.append(False)

    return result_flags
