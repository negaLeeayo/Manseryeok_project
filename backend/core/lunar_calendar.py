import os
from pathlib import Path
import xml.etree.ElementTree as ET

import requests
from dotenv import load_dotenv


env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

KASI_API_KEY = os.getenv("KASI_API_KEY")
def convert_lunar_to_solar(
    year: int,
    month: int,
    day: int,
    is_leap_month: bool = False
) -> dict:
    """
    음력 날짜를 양력 날짜로 변환하는 함수
    """

    converted = request_lunar_to_solar_from_kasi(
        year=year,
        month=month,
        day=day,
        is_leap_month=is_leap_month
    )

    return {
        "solar_year": converted["solar_year"],
        "solar_month": converted["solar_month"],
        "solar_day": converted["solar_day"],
        "is_converted": True,
        "original_lunar": {
            "year": converted["lunar_year"],
            "month": converted["lunar_month"],
            "day": converted["lunar_day"],
            "is_leap_month": is_leap_month,
        },
        "kasi_info": {
            "lunar_iljin": converted["lunar_iljin"],
            "lunar_secha": converted["lunar_secha"],
            "lunar_wolgeon": converted["lunar_wolgeon"],
            "lunar_leap_month": converted["lunar_leap_month"],
        }
    }
def normalize_birth_date(
    year: int,
    month: int,
    day: int,
    calendar_type: str = "solar",
    is_leap_month: bool = False
) -> dict:
    """
    입력된 생년월일을 사주 계산용 양력 날짜로 정규화한다.
    """

    validate_birth_date_input(
        year=year,
        month=month,
        day=day,
        calendar_type=calendar_type
    )

    if calendar_type == "solar":
        return {
            "solar_year": year,
            "solar_month": month,
            "solar_day": day,
            "calendar_type": "solar",
            "is_converted": False
        }

    if calendar_type == "lunar":
        converted = convert_lunar_to_solar(
            year=year,
            month=month,
            day=day,
            is_leap_month=is_leap_month
        )

        converted["calendar_type"] = "lunar"
        return converted

    raise ValueError("calendar_type must be 'solar' or 'lunar'")
def check_kasi_api_key() -> dict:
    """
    한국천문연구원 API 키가 설정되어 있는지 확인하는 함수
    """

    if not KASI_API_KEY:
        return {
            "is_set": False,
            "message": "KASI_API_KEY가 설정되어 있지 않습니다."
        }

    return {
        "is_set": True,
        "message": "KASI_API_KEY가 설정되어 있습니다."
    }
def request_lunar_to_solar_from_kasi(
    year: int,
    month: int,
    day: int,
    is_leap_month: bool = False
) -> dict:
    """
    한국천문연구원 음양력 API로 음력 날짜를 양력 날짜로 변환한다.
    """

    if not KASI_API_KEY:
        raise ValueError("KASI_API_KEY가 설정되어 있지 않습니다.")

    url = "http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getSolCalInfo"

    params = {
        "serviceKey": KASI_API_KEY,
        "lunYear": str(year),
        "lunMonth": f"{month:02d}",
        "lunDay": f"{day:02d}",
        "lunLeapmonth": "윤" if is_leap_month else "평",
    }

    response = requests.get(url, params=params, timeout=10)

    if response.status_code != 200:
        raise ValueError(
            f"KASI API 요청 실패: {response.status_code}, 응답내용: {response.text}"
        )

    root = ET.fromstring(response.text)

    result_code = root.findtext(".//resultCode")
    result_msg = root.findtext(".//resultMsg")

    if result_code != "00":
        raise ValueError(f"KASI API 응답 오류: {result_code}, {result_msg}")

    item = root.find(".//item")

    if item is None:
        raise ValueError("KASI API 응답에 변환 결과가 없습니다.")

    return {
        "solar_year": int(item.findtext("solYear")),
        "solar_month": int(item.findtext("solMonth")),
        "solar_day": int(item.findtext("solDay")),
        "lunar_year": int(item.findtext("lunYear")),
        "lunar_month": int(item.findtext("lunMonth")),
        "lunar_day": int(item.findtext("lunDay")),
        "lunar_leap_month": item.findtext("lunLeapmonth"),
        "lunar_iljin": item.findtext("lunIljin"),
        "lunar_secha": item.findtext("lunSecha"),
        "lunar_wolgeon": item.findtext("lunWolgeon"),
    }
def validate_birth_date_input(
    year: int,
    month: int,
    day: int,
    calendar_type: str,
) -> None:
    """
    생년월일 입력값을 검증한다.
    """

    if year < 1900 or year > 2100:
        raise ValueError("year는 1900 이상 2100 이하만 입력할 수 있습니다.")

    if month < 1 or month > 12:
        raise ValueError("month는 1 이상 12 이하만 입력할 수 있습니다.")

    if day < 1 or day > 31:
        raise ValueError("day는 1 이상 31 이하만 입력할 수 있습니다.")

    if calendar_type not in ["solar", "lunar"]:
        raise ValueError("calendar_type은 'solar' 또는 'lunar'만 가능합니다.")
    import pytest


def test_invalid_month_raises_error():
    with pytest.raises(ValueError):
        normalize_birth_date(
            year=2000,
            month=13,
            day=1,
            calendar_type="solar"
        )


def test_invalid_calendar_type_raises_error():
    with pytest.raises(ValueError):
        normalize_birth_date(
            year=2000,
            month=1,
            day=1,
            calendar_type="abc"
        )