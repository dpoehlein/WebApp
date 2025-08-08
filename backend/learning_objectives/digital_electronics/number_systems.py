from .number_systems import binary, octal, hex, bcd, gray_code

def get_checker(nested_subtopic_id: str):
    match nested_subtopic_id:
        case "binary":
            return binary.check_objectives
        case "octal":
            return octal.check_objectives
        case "hex":
            return hex.check_objectives
        case "bcd":
            return bcd.check_objectives
        case "gray_code":
            return gray_code.check_objectives
        case _:
            return None
