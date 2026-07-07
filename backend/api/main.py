from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import saju, jeolgi, lunar, auth

app = FastAPI(
    title="사주 API",
    description="사주/만세력 서비스 사주 API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(saju.router)
app.include_router(jeolgi.router)
app.include_router(lunar.router)
app.include_router(auth.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "사주 API"}