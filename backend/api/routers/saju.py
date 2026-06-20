from fastapi import APIRouter, HTTPException
from schemas.saju import SajuRequest, SajuResponse

router = APIRouter(prefix="/saju", tags=["사주"])

@router.get("/", response_model=SajuResponse)
async def get_saju(birth: str, hour: int, gender: str, is_lunar: bool = False):
    """
    사주팔자 계산
    - birth: 생년월일 (예: 1995-03-15)
    - hour: 태어난 시간 (0~23)
    - gender: 성별 (M/F)
    - is_lunar: 음력 여부
    """
    try:
        # TODO: core.saju.calculate_saju 연동 예정
        # from core.saju import calculate_saju
        # result = calculate_saju(birth, hour, gender, is_lunar)
        return {"message": "사주 계산 엔진 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daewoon")
async def get_daewoon(birth: str, gender: str):
    """
    대운 계산
    - birth: 생년월일
    - gender: 성별 (M/F)
    """
    try:
        # TODO: core.saju.calculate_daewoon 연동 예정
        return {"message": "대운 계산 엔진 연동 예정"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))