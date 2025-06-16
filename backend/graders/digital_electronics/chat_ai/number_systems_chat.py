import os
import json
import re
import ast
from typing import List, Union
from dotenv import load_dotenv
from openai import OpenAI

# ✅ Load .env before using getenv
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("❌ OPENAI_API_KEY is not set!")

client = OpenAI(api_key=api_key)

# Each nested_subtopic has specific objectives
NESTED_OBJECTIVES = {
    "binary": [
        "Understand that binary is a base-2 number system using only 0 and 1.",
        "Convert decimal numbers to 4-bit and 8-bit binary values.",
        "Convert binary numbers back to decimal form.",
        "Explain the significance of the least significant bit (LSB) and most significant bit (MSB).",
        "Identify how 4-bit binary forms a nibble and 8-bit binary forms a byte.",
        "Use binary place values (1, 2, 4, 8...) to compute decimal equivalents."
    ],
    "octal": [
        "Understand that octal is a base-8 number system using digits 0 to 7.",
        "Convert decimal numbers to octal values.",
        "Convert octal numbers back to decimal form.",
        "Explain the relationship between octal and binary.",
        "Use place values in octal to compute decimal equivalents.",
        "Apply octal conversions in computing contexts."
    ],
    "hex": [
        "Explain what hexadecimal is and how it relates to binary.",
        "Convert binary to hexadecimal.",
        "Convert hexadecimal to binary.",
        "Explain common uses of hex in computing (e.g. memory addresses).",
        "Identify a single hex digit represents 4 binary bits.",
        "Convert hex to decimal and vice versa."
    ],
    "bcd": [
        "Understand Binary Coded Decimal (BCD) representation.",
        "Convert decimal numbers to BCD format.",
        "Convert BCD numbers back to decimal form.",
        "Explain how BCD differs from pure binary representation.",
        "Use BCD in digital systems and applications.",
        "Identify advantages and limitations of BCD."
    ],
    "gray_code": [
        "Understand the concept of Gray Code and its properties.",
        "Convert binary numbers to Gray Code.",
        "Convert Gray Code back to binary numbers.",
        "Explain uses of Gray Code in error correction and digital communication.",
        "Identify the relationship between successive Gray Code values.",
        "Apply Gray Code in practical digital systems."
    ],
    # Additional subtopics can be added here.
}

def evaluate_number_systems_chat(message: str, history: List[dict], nested_subtopic: str) -> List[Union[bool, str]]:
    print(f"🔍 EVALUATING with nested_subtopic = {nested_subtopic}")
    print(f"📝 Message: {message}")
    print(f"🧠 History length: {len(history)}")

    objectives = NESTED_OBJECTIVES.get(nested_subtopic)
    if not objectives:
        print(f"⚠️ No objectives found for nested_subtopic '{nested_subtopic}'")
        return [False] * 6

    full_chat = history + [{"role": "user", "content": message}]

    eval_prompt = (
        f"You are an AI tutor evaluating a student's understanding of the following objectives for the topic '{nested_subtopic}':\n" +
        "\n".join([f"{i+1}. {obj}" for i, obj in enumerate(objectives)]) +
        "\n\nBased on the full chat history below, return a Python-style array of flags for each objective using true, false, or 'partial':\n" +
        "Respond ONLY with the array. Do not include any explanation.\n\n" +
        "Chat History:\n" +
        "\n".join([f"{m['role']}: {m['content']}" for m in full_chat])
    )

    try:
        print("📨 Sending prompt to GPT...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": eval_prompt}],
            temperature=0.0,
            max_tokens=200
        )

        print("📨 GPT Response Object:", response)
        raw = response.choices[0].message.content.strip()
        print("📊 GPT Eval Raw:", raw)

        # Replace smart quotes and ensure lowercase booleans
        cleaned = (
            raw.replace("“", '"')
                .replace("”", '"')
                .replace("‘", "'")
                .replace("’", "'")
                .replace("true", "True")
                .replace("false", "False")
        )

        # Safely evaluate with ast.literal_eval (handles true/false/'partial')
        parsed = ast.literal_eval(cleaned)
        print("✅ Parsed Progress Flags:", parsed)

        if isinstance(parsed, list) and len(parsed) == len(objectives):
            return [
                True if x is True else "partial" if str(x).lower() == "partial" else False
                for x in parsed
            ]
        else:
            print("⚠️ GPT returned invalid array or length mismatch:", parsed)
            return [False] * len(objectives)

    except Exception as e:
        print("❌ GPT eval error:", e)
        return [False] * len(objectives)
