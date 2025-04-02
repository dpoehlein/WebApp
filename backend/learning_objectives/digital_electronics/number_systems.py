import re
from collections import defaultdict

binary_learning_objectives = [
    {"id": "bin_to_dec", "description": "Convert binary to decimal", "min_successes": 3, "type": "conversion"},
    {"id": "dec_to_bin", "description": "Convert decimal to binary", "min_successes": 3, "type": "conversion"},
    {"id": "lsb_msb_order", "description": "Understand LSB and MSB order", "min_successes": 2, "type": "concept"},
    {"id": "bit_nibble_byte", "description": "Identify bit, nibble, and byte", "min_successes": 2, "type": "definition"},
    {"id": "binary_math", "description": "Perform simple binary addition", "min_successes": 2, "type": "calculation"},
    {"id": "binary_usage", "description": "Explain real-world applications of binary", "min_successes": 1, "type": "application"}
]

octal_learning_objectives = [
    {"id": "oct_to_dec", "description": "Convert octal to decimal", "min_successes": 2, "type": "conversion"},
    {"id": "dec_to_oct", "description": "Convert decimal to octal", "min_successes": 2, "type": "conversion"},
    {"id": "octal_base8", "description": "Understand base-8 representation", "min_successes": 1, "type": "concept"}
]

hex_learning_objectives = [
    {"id": "hex_to_dec", "description": "Convert hexadecimal to decimal", "min_successes": 2, "type": "conversion"},
    {"id": "dec_to_hex", "description": "Convert decimal to hexadecimal", "min_successes": 2, "type": "conversion"},
    {"id": "hex_base16", "description": "Understand base-16 representation", "min_successes": 1, "type": "concept"}
]

bcd_learning_objectives = [
    {"id": "binary_to_bcd", "description": "Convert binary to BCD", "min_successes": 2, "type": "conversion"},
    {"id": "bcd_to_binary", "description": "Convert BCD to binary", "min_successes": 2, "type": "conversion"},
    {"id": "bcd_rules", "description": "Understand BCD encoding rules", "min_successes": 1, "type": "concept"}
]

gray_code_learning_objectives = [
    {"id": "binary_to_gray", "description": "Convert binary to Gray code", "min_successes": 2, "type": "conversion"},
    {"id": "gray_to_binary", "description": "Convert Gray code to binary", "min_successes": 2, "type": "conversion"},
    {"id": "gray_code_usage", "description": "Explain where Gray code is used", "min_successes": 1, "type": "application"}
]

# Aggregate by ID for quick lookup
objective_sets = {
    "binary": binary_learning_objectives,
    "octal": octal_learning_objectives,
    "hex": hex_learning_objectives,
    "bcd": bcd_learning_objectives,
    "gray_code": gray_code_learning_objectives,
}

# Keywords for rule-based checking
keywords = {
    "bin_to_dec": [r"\b\d{2,}\b\s*=\s*\d+"],  # binary equals decimal
    "dec_to_bin": [r"\b\d+\b\s*=\s*[01]{2,}"],  # decimal equals binary
    "lsb_msb_order": ["least significant", "most significant", "lsb", "msb"],
    "bit_nibble_byte": ["bit", "nibble", "byte"],
    "binary_math": [r"[01]+\s*\+\s*[01]+", "binary addition"],
    "binary_usage": ["used in computers", "real-world", "digital logic", "data encoding"],

    "oct_to_dec": [r"[0-7]+\s*=\s*\d+"],
    "dec_to_oct": [r"\d+\s*=\s*[0-7]+"],
    "octal_base8": ["base-8", "octal"],

    "hex_to_dec": [r"0x[0-9A-Fa-f]+\s*=\s*\d+"],
    "dec_to_hex": [r"\d+\s*=\s*0x[0-9A-Fa-f]+"],
    "hex_base16": ["base-16", "hexadecimal"],

    "binary_to_bcd": ["binary to bcd", "convert to bcd"],
    "bcd_to_binary": ["bcd to binary"],
    "bcd_rules": ["bcd rule", "8421", "binary-coded decimal"],

    "binary_to_gray": ["binary to gray", "gray code conversion"],
    "gray_to_binary": ["gray to binary"],
    "gray_code_usage": ["gray code used", "position encoders", "minimize transition"]
}

def get_objective_state(history):
    text = " ".join(msg["content"].lower() for msg in history if msg["role"] in ["user", "assistant"])
    results = []

    # Determine active subtopic
    active_subtopic = None
    for key in objective_sets.keys():
        if key in text:
            active_subtopic = key
            break
    if not active_subtopic:
        active_subtopic = "binary"  # fallback for default Number Systems page

    objectives = objective_sets[active_subtopic]
    counter = defaultdict(int)

    for obj in objectives:
        obj_id = obj["id"]
        patterns = keywords.get(obj_id, [])
        for pattern in patterns:
            if isinstance(pattern, str):
                if pattern.lower() in text:
                    counter[obj_id] += 1
            else:  # regex
                if re.search(pattern, text):
                    counter[obj_id] += 1

    # Evaluate against min_successes
    for obj in objectives:
        obj_id = obj["id"]
        passed = counter[obj_id] >= obj["min_successes"]
        results.append(passed)

    return results
