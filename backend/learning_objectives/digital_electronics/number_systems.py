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
    "octal": [
        {"id": "oct_to_dec", "description": "Convert octal to decimal", "min_successes": 2},
        {"id": "dec_to_oct", "description": "Convert decimal to octal", "min_successes": 2},
        {"id": "octal_base8", "description": "Understand base-8", "min_successes": 1}
    ],
    "hex": [
        {"id": "hex_to_dec", "description": "Convert hex to decimal", "min_successes": 2},
        {"id": "dec_to_hex", "description": "Convert decimal to hex", "min_successes": 2},
        {"id": "hex_base16", "description": "Understand base-16", "min_successes": 1}
    ],
    "bcd": [
        {"id": "binary_to_bcd", "description": "Convert binary to BCD", "min_successes": 2},
        {"id": "bcd_to_binary", "description": "Convert BCD to binary", "min_successes": 2},
        {"id": "bcd_rules", "description": "Understand BCD encoding", "min_successes": 1}
    ],
    "gray_code": [
        {"id": "binary_to_gray", "description": "Convert binary to Gray code", "min_successes": 2},
        {"id": "gray_to_binary", "description": "Convert Gray code to binary", "min_successes": 2},
        {"id": "gray_code_usage", "description": "Explain Gray code use", "min_successes": 1}
    ]
}

# ✅ Match patterns (regex or string) per objective
keywords = {
    "binary_base2": ["only 0 and 1", "base-2", "uses digits 0 and 1"],
    "dec_to_bin": [r"\b\d+\b.*(in binary|to binary|is equal to).*0[01]+", r"convert \d+ to binary"],
    "bin_to_dec": [r"[01]{4,8}.*(=|is|means).*?\d+", r"convert [01]+ to decimal"],
    "lsb_msb_order": ["least significant", "most significant", "lsb", "msb", "rightmost", "leftmost"],
    "bit_nibble_byte": ["bit", "nibble", "byte", "4-bit", "8-bit"],
    "binary_math": [r"[01]+\s*\+\s*[01]+", "binary addition", "add binary"],
    "binary_usage": ["used in computers", "digital logic", "data encoding", "real-world", "storage", "memory"],
    "oct_to_dec": [r"[0-7]+\s*=\s*\d+", r"convert octal to decimal"],
    "dec_to_oct": [r"\d+\s*=\s*[0-7]+", r"convert decimal to octal"],
    "octal_base8": ["base-8", "octal"],
    "hex_to_dec": [r"0x[0-9A-Fa-f]+\s*=\s*\d+", r"convert hex to decimal"],
    "dec_to_hex": [r"\d+\s*=\s*0x[0-9A-Fa-f]+", r"convert decimal to hex"],
    "hex_base16": ["base-16", "hexadecimal"],
    "binary_to_bcd": ["binary to bcd", "convert to bcd"],
    "bcd_to_binary": ["bcd to binary"],
    "bcd_rules": ["8421", "bcd rule", "binary-coded decimal"],
    "binary_to_gray": ["binary to gray", "gray code conversion"],
    "gray_to_binary": ["gray to binary"],
    "gray_code_usage": ["gray code used", "position encoders", "minimize transitions"]
}

def get_objective_state(history):
    user_text = " ".join(msg["content"].lower() for msg in history if msg["role"] == "user")
    results = []
    counter = defaultdict(int)

    active_subtopic = "binary"  # fallback default
    for key in objective_sets:
        if key in user_text:
            active_subtopic = key
            break

    objectives = objective_sets[active_subtopic]

    for obj in objectives:
        obj_id = obj["id"]
        patterns = keywords.get(obj_id, [])
        for pattern in patterns:
            if isinstance(pattern, str):
                if pattern.lower() in user_text:
                    counter[obj_id] += 1
            elif re.search(pattern, user_text):
                counter[obj_id] += 1

    for obj in objectives:
        passed = counter[obj["id"]] >= obj["min_successes"]
        results.append(passed)

    return {
        "objectives": results,
        "completed": sum(results),
        "total": len(results),
        "score": round((sum(results) / len(results)) * 100)
    }