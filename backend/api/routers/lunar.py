from fastapi import APIRouter, HTTPException

from core.lunar_calendar import normalize_birth_date

router = APIRouter(prefix="/lunar", tags=["lunar"])


@router.get("/convert")
def convert_lunar_date(
    year: int,
    month: int,
    day: int,
    calendar_type: str = "solar",
    is_leap_month: bool = False
):
    try:
        result = normalize_birth_date(
            year=year,
            month=month,
            day=day,
            calendar_type=calendar_type,
            is_leap_month=is_leap_month
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
