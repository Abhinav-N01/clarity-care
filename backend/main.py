from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import bills, insurance, predictor, chat

app = FastAPI(title="Clarity Care API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bills.router, prefix="/api/bills", tags=["bills"])
app.include_router(insurance.router, prefix="/api/insurance", tags=["insurance"])
app.include_router(predictor.router, prefix="/api/predict", tags=["predict"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def root():
    return {"status": "Clarity Care API running"}
