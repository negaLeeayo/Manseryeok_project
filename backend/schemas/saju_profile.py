from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SajuProfileBase(BaseModel):
    """사주 프로필 공통 입력값."""

    name: str = Field(
        min_length=1,
        max_length=100,
        examples=["홍길동"],
    )

    relationship_type: str = Field(
        min_length=1,
        max_length=50,
        examples=["self"],
    )

    birth_date: date

    birth_time: time | None = None

    gender: Literal["M", "F"]

    calendar_type: Literal["solar", "lunar"] = "solar"

    is_leap_month: bool = False

    @model_validator(mode="after")
    def validate_leap_month(self):
        """
        윤달은 음력 생일에만 사용할 수 있다.
        """

        if self.calendar_type == "solar" and self.is_leap_month:
            raise ValueError(
                "is_leap_month는 음력 입력일 때만 true로 설정할 수 있습니다."
            )

        return self


class SajuProfileCreate(SajuProfileBase):
    """사주 프로필 생성 요청."""

    pass


class SajuProfileUpdate(BaseModel):
    """
    사주 프로필 수정 요청.

    전달된 값만 수정한다.
    """

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    relationship_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    birth_date: date | None = None

    birth_time: time | None = None

    gender: Literal["M", "F"] | None = None

    calendar_type: Literal["solar", "lunar"] | None = None

    is_leap_month: bool | None = None

    @model_validator(mode="after")
    def validate_leap_month(self):
        """
        수정 요청에서 양력과 윤달 true를 동시에 전달하는 것을 막는다.

        기존 DB 값과 조합한 최종 검증은 수정 API에서도 한 번 더 수행한다.
        """

        if self.calendar_type == "solar" and self.is_leap_month is True:
            raise ValueError(
                "is_leap_month는 음력 입력일 때만 true로 설정할 수 있습니다."
            )

        return self


class SajuProfileRead(SajuProfileBase):
    """사주 프로필 조회 응답."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime