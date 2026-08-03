from __future__ import annotations

from datetime import date, datetime, time, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from models.user import User


class SajuProfile(Base):
    __tablename__ = "saju_profiles"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    # 해당 사주 프로필을 저장한 사용자
    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # 프로필 이름 또는 대상자의 이름
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # 본인, 가족, 친구 등의 관계
    relationship_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    birth_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    # 출생 시간을 모르는 경우를 허용한다.
    birth_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    gender: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    # solar 또는 lunar
    calendar_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    # 음력 생일인 경우 윤달 여부
    is_leap_month: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # 이 프로필을 소유한 사용자
    user: Mapped[User] = relationship(
        back_populates="saju_profiles",
    )