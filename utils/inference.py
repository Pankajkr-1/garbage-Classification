import json
from pathlib import Path

import numpy as np
import tensorflow as tf


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model" / "garbage_classifier_final.keras"
LABELS_PATH = BASE_DIR / "model" / "labels.json"
RULES_PATH = BASE_DIR / "data" / "disposal_rules.json"


print(f"Loading model from {MODEL_PATH}...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded.")


with open(LABELS_PATH, encoding="utf-8") as f:
    LABELS = json.load(f)


with open(RULES_PATH, encoding="utf-8") as f:
    RULES = json.load(f)


LOW_CONFIDENCE_THRESHOLD = 0.45


def predict(image_array: np.ndarray):

    output = model.predict(image_array, verbose=0)[0]

    idx = int(np.argmax(output))

    confidence = float(output[idx])

    label = LABELS[idx]

    all_scores = {
        LABELS[i]: round(float(output[i]), 4)
        for i in range(len(LABELS))
    }

    if confidence < LOW_CONFIDENCE_THRESHOLD:
        return "unknown", confidence, all_scores

    return label, confidence, all_scores


def get_disposal_info(label: str) -> dict:
    return RULES.get(label, RULES["unknown"])