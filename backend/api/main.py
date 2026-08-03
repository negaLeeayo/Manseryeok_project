from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import (
    auth,
    daewoon,
    jeolgi,
    lunar,
    saju,
    saju_profile,
)

app = FastAPI(
    title="사주 API",
    description="사주/만세력 서비스 사주 API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(saju.router)
app.include_router(jeolgi.router)
app.include_router(lunar.router)
app.include_router(auth.router)
app.include_router(saju_profile.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "사주 API"}

app.include_router(daewoon.router)