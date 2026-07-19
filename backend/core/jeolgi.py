import math
from datetime import datetime, timezone, timedelta

import ephem


KST = timezone(timedelta(hours=9))

def get_solar_longitude(dt: datetime) -> float:
    """
    특정 시각의 태양 황경을 계산한다.

    시간대 정보가 없는 datetime은 한국 표준시(KST)로 처리한다.
    """
    if not isinstance(dt, datetime):
        raise TypeError("dt는 datetime 객체여야 합니다.")

    # 시간대 정보가 없다면 한국 표준시로 처리
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=KST)

    # PyEphem 계산을 위해 UTC로 변환
    utc_dt = dt.astimezone(timezone.utc)

    ephem_date = ephem.Date(utc_dt)
    sun = ephem.Sun(ephem_date)
    ecliptic = ephem.Ecliptic(sun, epoch=ephem_date)
    longitude = math.degrees(float(ecliptic.lon))

    return longitude % 360

JEOLGI_NAMES = [
    "춘분",
    "청명",
    "곡우",
    "입하",
    "소만",
    "망종",
    "하지",
    "소서",
    "대서",
    "입추",
    "처서",
    "백로",
    "추분",
    "한로",
    "상강",
    "입동",
    "소설",
    "대설",
    "동지",
    "소한",
    "대한",
    "입춘",
    "우수",
    "경칩",
]


def get_jeolgi_name(dt: datetime) -> str:
    """
    특정 날짜와 시각의 태양 황경을 기준으로 현재 절기 이름을 반환한다.

    24절기는 태양 황경을 15도 간격으로 나눈다.

    Args:
        dt: 절기를 계산할 날짜와 시각

    Returns:
        현재 절기 이름
    """
    longitude = get_solar_longitude(dt)

    index = int(longitude // 15)

    return JEOLGI_NAMES[index]