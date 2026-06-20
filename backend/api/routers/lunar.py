from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/lunar", tags=["음력"])

@router.get("/to-lunar")
async def to_lunar(date: str):
    """
    양력 → 음력 변환
    - date: 양력 날짜 (예: 1995-03-15)
    """
    try:
        # TODO: core.lunar_calendar.to_lunar 연동 예정
        # from core.lunar_calendar import to_lunar
        # result = to_lunar(date)
        return {"message": "양력→음력 변환 엔진 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/to-solar")
async def to_solar(year: int, month: int, day: int, is_leap: bool = False):
    """
    음력 → 양력 변환
    - year: 음력 연도
    - month: 음력 월
    - day: 음력 일
    - is_leap: 윤달 여부
    """
    try:
        # TODO: core.lunar_calendar.to_solar 연동 예정
        return {"message": "음력→양력 변환 엔진 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today-iljin")
async def get_today_iljin():
    """
    오늘 일진 조회
    """
    try:
        # TODO: core.lunar_calendar.get_iljin 연동 예정
        return {"message": "오늘 일진 조회 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))