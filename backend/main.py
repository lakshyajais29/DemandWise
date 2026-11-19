from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionRequest, PredictionResponse
from model_loader import predict

app = FastAPI(
    title='DemandWise API',
    description='E-Commerce Demand Forecasting',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/')
def root():
    return {'message': 'DemandWise API is running'}

@app.post('/predict', response_model=PredictionResponse)
def get_prediction(req: PredictionRequest):
    try:
        features = [
            req.lag_1, req.lag_7, req.lag_30,
            req.rolling_7, req.rolling_30,
            req.day_of_week, req.month, req.is_weekend
        ]
        predicted = predict(features)
        predicted = max(0, round(predicted, 2))

        reorder_qty = max(0, predicted - req.current_stock)

        if req.current_stock < predicted * 0.5:
            status = 'Low Stock'
            alert = f'Stock critically low! Reorder {reorder_qty:.0f} units.'
        elif req.current_stock > predicted * 1.5:
            status = 'Overstock'
            alert = f'Overstock detected. Excess: {req.current_stock - predicted:.0f} units.'
        else:
            status = 'OK'
            alert = None

        return PredictionResponse(
            stock_code=req.stock_code,
            predicted_demand=predicted,
            current_stock=req.current_stock,
            reorder_quantity=reorder_qty,
            stock_status=status,
            alert_message=alert
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
def health():
    return {'status': 'healthy'}