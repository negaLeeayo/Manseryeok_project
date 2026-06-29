from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/jeolgi", tags=["절기"])

@router.get("/")
async def get_jeolgi(year: int):
    """
    24절기 조회
    - year: 연도 (예: 2024)
    """
    try:
        # TODO: core.jeolgi.get_jeolgi 연동 예정
        # from core.jeolgi import get_jeolgi
        # result = get_jeolgi(year)
        return {"message": "절기 계산 엔진 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today")
async def get_today_jeolgi():
    """
    오늘 날짜 기준 현재 절기 조회
    """
    try:
        # TODO: core.jeolgi.get_today_jeolgi 연동 예정
        return {"message": "오늘 절기 조회 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))