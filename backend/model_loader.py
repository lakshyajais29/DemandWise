import pickle
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).parent / 'best_model.pkl'

_model = None

def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f'Model not found at {MODEL_PATH}. '
                'Run the Colab notebook first and place best_model.pkl in backend/.'
            )
        with open(MODEL_PATH, 'rb') as f:
            _model = pickle.load(f)
    return _model

def predict(features: list) -> float:
    model = get_model()
    arr = np.array(features).reshape(1, -1)
    return float(model.predict(arr)[0])