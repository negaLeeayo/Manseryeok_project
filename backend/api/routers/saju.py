from datetime import datetime
from core.daewoon import calculate_daewoon
from fastapi import APIRouter, HTTPException

from core.ganzhi import (
    calculate_ohaeng_distribution,
    get_stem_ohaeng,
)
from core.lunar_calendar import normalize_birth_date
from core.saju import calculate_saju
from schemas.saju import (
    SajuRequest,
    SajuResponse,
    Pillar,
    OhaengDistribution,
    Daewoon,
)
router = APIRouter(
    prefix="/saju",
    tags=["사주"],
)


@router.get("/", response_model=SajuResponse)
async def get_saju(
    birth: str,
    hour: int,
    gender: str,
    is_lunar: bool = False,
):
    """
    사주팔자를 계산한다.

    - birth: 생년월일, YYYY-MM-DD 형식
    - hour: 태어난 시간, 0~23
    - gender: 성별, M 또는 F
    - is_lunar: 음력 여부
    """
    try:
        # 1. 시간 범위 검사
        if not 0 <= hour <= 23:
            raise HTTPException(
                status_code=400,
                detail="hour는 0 이상 23 이하여야 합니다.",
            )

        # 2. 성별 검사
        normalized_gender = gender.upper()

        if normalized_gender not in ("M", "F"):
            raise HTTPException(
                status_code=400,
                detail="gender는 M 또는 F여야 합니다.",
            )

        # 3. 입력 날짜 문자열 변환
        parsed_date = datetime.strptime(
            birth,
            "%Y-%m-%d",
        )

        # 4. 양력 또는 음력 구분
        calendar_type = (
            "lunar"
            if is_lunar
            else "solar"
        )

        # 5. 음력인 경우 양력으로 변환
        # 반환 형식:
        # {
        #     "solar_year": 2026,
        #     "solar_month": 7,
        #     "solar_day": 19,
        #     "calendar_type": "solar",
        #     "is_converted": False,
        # }
        normalized_date = normalize_birth_date(
            parsed_date.year,
            parsed_date.month,
            parsed_date.day,
            calendar_type,
        )

        # 6. 변환된 날짜와 태어난 시간 결합
        birth_datetime = datetime(
            int(normalized_date["solar_year"]),
            int(normalized_date["solar_month"]),
            int(normalized_date["solar_day"]),
            hour,
            0,
            0,
        )

        # 7. 연주·월주·일주·시주 계산
        result = calculate_saju(
            birth_datetime
        )

        # 8. 천간과 지지 총 8글자의 오행 분포 계산
        ohaeng_counts = calculate_ohaeng_distribution(
            [
                result.year_pillar,
                result.month_pillar,
                result.day_pillar,
                result.hour_pillar,
            ]
        )

        # 9. API 응답 반환
        return SajuResponse(
            year_pillar=Pillar(
                cheongan=result.year_pillar.stem,
                jiji=result.year_pillar.branch,
                ohaeng=get_stem_ohaeng(
                    result.year_pillar.stem
                ),
            ),
            month_pillar=Pillar(
                cheongan=result.month_pillar.stem,
                jiji=result.month_pillar.branch,
                ohaeng=get_stem_ohaeng(
                    result.month_pillar.stem
                ),
            ),
            day_pillar=Pillar(
                cheongan=result.day_pillar.stem,
                jiji=result.day_pillar.branch,
                ohaeng=get_stem_ohaeng(
                    result.day_pillar.stem
                ),
            ),
            hour_pillar=Pillar(
                cheongan=result.hour_pillar.stem,
                jiji=result.hour_pillar.branch,
                ohaeng=get_stem_ohaeng(
                    result.hour_pillar.stem
                ),
            ),
            ohaeng_dist=OhaengDistribution(
                mok=ohaeng_counts["목"],
                hwa=ohaeng_counts["화"],
                to=ohaeng_counts["토"],
                geum=ohaeng_counts["금"],
                su=ohaeng_counts["수"],
            ),
            daewoon_list=None,
            message="사주팔자 계산이 완료되었습니다.",
        )

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except KeyError as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "날짜 변환 결과에 필요한 값이 없습니다: "
                f"{error}"
            ),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "사주 계산 중 오류가 발생했습니다: "
                f"{error}"
            ),
        ) from error


@router.get("/daewoon")
async def get_daewoon(
    birth: str,
    gender: str,
):
    """
    대운 계산

    현재는 아직 계산 엔진이 구현되지 않았다.
    """
    return {
        "message": "대운 계산 엔진 연동 예정"
    }
@router.post("/calculate", response_model=SajuResponse)
async def calculate_saju_post(request: SajuRequest):
    try:
        if request.hour < 0 or request.hour > 23:
            raise HTTPException(
                status_code=400,
                detail="hour는 0 이상 23 이하여야 합니다."
            )

        if request.gender not in ["M", "F"]:
            raise HTTPException(
                status_code=400,
                detail="gender는 M 또는 F여야 합니다."
            )

        birth_date = datetime.strptime(request.birth, "%Y-%m-%d")

        calendar_type = "lunar" if request.is_lunar else "solar"

        normalized_date = normalize_birth_date(
            birth_date.year,
            birth_date.month,
            birth_date.day,
            calendar_type
        )

        solar_datetime = datetime(
            normalized_date["solar_year"],
            normalized_date["solar_month"],
            normalized_date["solar_day"],
            request.hour
        )

        result = calculate_saju(solar_datetime)
        
        daewoon_results = calculate_daewoon(
            month_stem=result.month_pillar.stem,
            month_branch=result.month_pillar.branch,
            year_stem=result.year_pillar.stem,
            gender=request.gender,
            start_age=1,
            count=8
        )

        pillars = [
            result.year_pillar,
            result.month_pillar,
            result.day_pillar,
            result.hour_pillar
        ]

        ohaeng = calculate_ohaeng_distribution(pillars)

        return SajuResponse(
            year_pillar=Pillar(
                cheongan=result.year_pillar.stem,
                jiji=result.year_pillar.branch,
                ohaeng=get_stem_ohaeng(result.year_pillar.stem)
            ),
            month_pillar=Pillar(
                cheongan=result.month_pillar.stem,
                jiji=result.month_pillar.branch,
                ohaeng=get_stem_ohaeng(result.month_pillar.stem)
            ),
            day_pillar=Pillar(
                cheongan=result.day_pillar.stem,
                jiji=result.day_pillar.branch,
                ohaeng=get_stem_ohaeng(result.day_pillar.stem)
            ),
            hour_pillar=Pillar(
                cheongan=result.hour_pillar.stem,
                jiji=result.hour_pillar.branch,
                ohaeng=get_stem_ohaeng(result.hour_pillar.stem)
            ),
            ohaeng_dist=OhaengDistribution(
                mok=ohaeng["목"],
                hwa=ohaeng["화"],
                to=ohaeng["토"],
                geum=ohaeng["금"],
                su=ohaeng["수"]
            ),
            daewoon_list=[
                Daewoon(
                    age=item.age,
                    cheongan=item.cheongan,
                    jiji=item.jiji,
                    ohaeng=item.ohaeng
                )
                for item in daewoon_results
                ],
                message="사주팔자 계산이 완료되었습니다."
                )

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=f"입력값이 올바르지 않습니다: {error}"
        )

    except KeyError as error:
        raise HTTPException(
            status_code=500,
            detail=f"사주 계산 결과 처리 중 오류가 발생했습니다: {error}"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"서버 내부 오류가 발생했습니다: {error}"
        )