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
        {"id": "binary_usage", "description": "Explain binary's real-world use", "min_successes": 1},
    ],
}

# ✅ Regex and phrase match patterns
keywords = {
    "binary_base2": [
        r"binary.*(0 and 1|base[- ]?2)", r"base[- ]?2 number system", r"digits.*0.*1", r"binary is 0[- ]1"
    ],
    "dec_to_bin": [
        r"\b\d{1,3}\b\s*(in binary|to binary|=|equals)?\s*0[01]{4,8}",
        r"binary equivalent of \d{1,3}",
        r"convert(ed)? \d{1,3} to binary",
        r"decimal.*to.*binary",
        r"\d{1,3}.*binary is 0[01]{4,8}",
    ],
    "bin_to_dec": [
        r"0[01]{2,8}\s*(=|is|means)\s*\d{1,3}",
        r"binary.*equals.*\d{1,3}",
        r"\d{1,3}\s*is\s*the\s*decimal\s*of\s*0[01]{2,8}",
        r"convert(ed)? binary.*to decimal"
    ],
    "lsb_msb_order": [
        r"\blsb\b", r"\bmsb\b", r"least significant", r"most significant", r"(rightmost|leftmost).*bit", r"bit.*order"
    ],
    "bit_nibble_byte": [
        r"\bbit\b", r"\bnibble\b", r"\bbyte\b", r"4[- ]?bit.*nibble", r"8[- ]?bit.*byte", r"group of (4|8)"
    ],
    "binary_math": [
        r"[01]{2,8}\s*\+\s*[01]{2,8}", r"binary addition", r"add binary", r"binary sum", r"1[01]* plus 1[01]*"
    ],
    "binary_usage": [
        r"used in (computers|electronics|memory|storage)", r"digital logic", r"data encoding", r"real[- ]?world use"
    ]
}

def get_objective_state(history):
    # ✅ Pull both user and assistant content
    relevant_messages = [msg["content"].lower() for msg in history if msg["role"] in ("user", "assistant")]
    result_flags = []

    print("🔍 AI Copilot Debug Log — Evaluating Chat History")
    for i, msg in enumerate(relevant_messages):
        print(f"[{i}] {msg}")

    active_subtopic = "binary"
    objectives = objective_sets.get(active_subtopic, [])

    for obj in objectives:
        obj_id = obj["id"]
        patterns = keywords.get(obj_id, [])
        match_count = 0

        print(f"\n🧠 Checking Objective: {obj_id} — needs {obj['min_successes']} hits")

        for msg in relevant_messages:
            for pattern in patterns:
                if re.search(pattern, msg):
                    print(f"✅ Match: '{pattern}' in '{msg}'")
                    match_count += 1
                else:
                    print(f"❌ No Match: '{pattern}' in '{msg}'")

        if match_count >= obj["min_successes"]:
            result_flags.append(True)
        elif match_count > 0:
            result_flags.append("progress")
        else:
            result_flags.append(False)

    print(f"\n✅ Final Flags: {result_flags}")
    return result_flags
