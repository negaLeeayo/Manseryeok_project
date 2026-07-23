from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.daewoon import calculate_daewoon_from_saju
from core.saju import calculate_saju


router = APIRouter(
    prefix="/daewoon",
    tags=["daewoon"],
)


class DaewoonRequest(BaseModel):
    birth_datetime: datetime = Field(
        ...,
        description="출생 일시",
        examples=["2003-01-17T14:00:00"],
    )

    gender: str = Field(
        ...,
        description="성별: male 또는 female",
        examples=["male"],
    )


@router.post("")
def get_daewoon(request: DaewoonRequest):
    saju_result = calculate_saju(
        request.birth_datetime
    )

    daewoon_result = calculate_daewoon_from_saju(
        birth_datetime=request.birth_datetime,
        gender=request.gender,
        saju_result=saju_result,
    )

    return daewoon_result