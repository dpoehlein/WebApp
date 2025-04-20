import pandas as pd
from io import BytesIO

def grade(file: bytes) -> dict:
    try:
        df_dict = pd.read_excel(BytesIO(file), sheet_name=None)

        review_df = df_dict.get("Quick Conversions Review")
        if review_df is None:
            return {
                "score": 0,
                "feedback": "❌ Missing 'Quick Conversions Review' sheet in your Excel file."
            }

        review_data = review_df.iloc[12:, 1:8].copy()
        review_data.columns = ["Question", "Decimal", "Binary", "Octal", "Hex", "BCD", "Gray"]
        review_data.reset_index(drop=True, inplace=True)
        for col in review_data.columns:
            review_data[col] = review_data[col].astype(str).str.strip()

        correct_answers = {
            "A": {"Decimal": "25", "Binary": "11001", "Octal": "31", "Hex": "19", "BCD": "0010 0101", "Gray": "10101"},
            "B": {"Decimal": "13", "Binary": "1101", "Octal": "15", "Hex": "D", "BCD": "0001 0011", "Gray": "1001"},
            "C": {"Decimal": "25", "Binary": "11001", "Octal": "31", "Hex": "19", "BCD": "0010 0101", "Gray": "10101"},
            "D": {"Decimal": "31", "Binary": "11111", "Octal": "37", "Hex": "1F", "BCD": "0011 0001", "Gray": "10000"},
            "E": {"Decimal": "64", "Binary": "1000000", "Octal": "100", "Hex": "40", "BCD": "0110 0100", "Gray": "1100000"},
        }

        feedback_lines = []
        total_score = 0
        total_possible = 0

        for _, row in review_data.iterrows():
            q = row["Question"]
            if q in correct_answers:
                for col in ["Decimal", "Binary", "Octal", "Hex", "BCD", "Gray"]:
                    total_possible += 1
                    student = row[col].replace(" ", "").lower()
                    expected = correct_answers[q][col].replace(" ", "").lower()
                    if student == expected:
                        total_score += 1
                    else:
                        feedback_lines.append(f"{q} - {col} incorrect (Expected: {correct_answers[q][col]})")

        final_score = round((total_score / total_possible) * 100, 2)
        grade_msg = f"Your score: {final_score}%.\n"

        if feedback_lines:
            grade_msg += "Here are some things to improve:\n" + "\n".join(feedback_lines)
        else:
            grade_msg += "✅ Excellent! Everything looks correct."

        return {
            "score": final_score,
            "feedback": grade_msg
        }

    except Exception as e:
        return {
            "score": 0,
            "feedback": f"❌ An error occurred while grading: {str(e)}"
        }
