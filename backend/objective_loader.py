import importlib.util
import os

def load_objective_checker(topic_id, subtopic_id=None, nested_subtopic_id=None):
    try:
        # Build path to the Python file to import dynamically
        if nested_subtopic_id:
            filepath = os.path.join("backend", "learning_objectives", topic_id, subtopic_id, f"{nested_subtopic_id}.py")
        elif subtopic_id:
            filepath = os.path.join("backend", "learning_objectives", topic_id, f"{subtopic_id}.py")
        else:
            filepath = os.path.join("backend", "learning_objectives", f"{topic_id}.py")

        if not os.path.exists(filepath):
           
            return None

        # Load the module dynamically
        spec = importlib.util.spec_from_file_location("objective_checker", filepath)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        return module.evaluate_objectives
    except Exception as e:
        
        return None
