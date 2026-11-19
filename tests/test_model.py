import sys, os, pickle, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

def test_model_loads():
    model_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'best_model.pkl')
    if not os.path.exists(model_path):
        import pytest; pytest.skip('Model not trained yet')
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    assert hasattr(model, 'predict')

def test_model_predict_shape():
    model_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'best_model.pkl')
    if not os.path.exists(model_path):
        import pytest; pytest.skip('Model not trained yet')
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    sample = np.array([[50, 45, 48, 47, 46.5, 1, 11, 0]])
    pred = model.predict(sample)
    assert pred.shape == (1,)
    assert pred[0] >= 0