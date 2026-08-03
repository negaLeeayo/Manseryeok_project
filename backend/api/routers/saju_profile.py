from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from db.database import get_db
from models.saju_profile import SajuProfile
from schemas.saju_profile import (
    SajuProfileCreate,
    SajuProfileRead,
    SajuProfileUpdate,
)


router = APIRouter(
    prefix="/saju-profiles",
    tags=["saju-profiles"],
)


# 아직 실제 로그인 사용자 연동 전이므로 임시 사용자 ID를 사용한다.
MOCK_USER_ID = 1


@router.post(
    "",
    response_model=SajuProfileRead,
    status_code=status.HTTP_201_CREATED,
)
def create_saju_profile(
    request: SajuProfileCreate,
    db: Session = Depends(get_db),
):
    """
    현재 사용자의 사주 프로필을 생성한다.
    """

    profile = SajuProfile(
        user_id=MOCK_USER_ID,
        name=request.name,
        relationship_type=request.relationship_type,
        birth_date=request.birth_date,
        birth_time=request.birth_time,
        gender=request.gender,
        calendar_type=request.calendar_type,
        is_leap_month=request.is_leap_month,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "",
    response_model=list[SajuProfileRead],
)
def get_saju_profiles(
    db: Session = Depends(get_db),
):
    """
    현재 사용자의 사주 프로필 목록을 조회한다.
    """

    statement = (
        select(SajuProfile)
        .where(SajuProfile.user_id == MOCK_USER_ID)
        .order_by(SajuProfile.created_at.desc())
    )

    profiles = db.scalars(statement).all()

    return profiles


@router.get(
    "/{profile_id}",
    response_model=SajuProfileRead,
)
def get_saju_profile(
    profile_id: int,
    db: Session = Depends(get_db),
):
    """
    현재 사용자의 사주 프로필 하나를 조회한다.
    """

    statement = select(SajuProfile).where(
        SajuProfile.id == profile_id,
        SajuProfile.user_id == MOCK_USER_ID,
    )

    profile = db.scalar(statement)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사주 프로필을 찾을 수 없습니다.",
        )

    return profile


@router.patch(
    "/{profile_id}",
    response_model=SajuProfileRead,
)
def update_saju_profile(
    profile_id: int,
    request: SajuProfileUpdate,
    db: Session = Depends(get_db),
):
    """
    현재 사용자의 사주 프로필을 수정한다.
    """

    statement = select(SajuProfile).where(
        SajuProfile.id == profile_id,
        SajuProfile.user_id == MOCK_USER_ID,
    )

    profile = db.scalar(statement)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사주 프로필을 찾을 수 없습니다.",
        )

    update_data = request.model_dump(exclude_unset=True)

    final_calendar_type = update_data.get(
        "calendar_type",
        profile.calendar_type,
    )
    final_is_leap_month = update_data.get(
        "is_leap_month",
        profile.is_leap_month,
    )

    if final_calendar_type == "solar" and final_is_leap_month:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="윤달은 음력 생일에만 설정할 수 있습니다.",
        )

    for field_name, value in update_data.items():
        setattr(profile, field_name, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_saju_profile(
    profile_id: int,
    db: Session = Depends(get_db),
):
    """
    현재 사용자의 사주 프로필을 삭제한다.
    """

    statement = select(SajuProfile).where(
        SajuProfile.id == profile_id,
        SajuProfile.user_id == MOCK_USER_ID,
    )

    profile = db.scalar(statement)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사주 프로필을 찾을 수 없습니다.",
        )

    db.delete(profile)
    db.commit()

    return None