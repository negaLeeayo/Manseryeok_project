from datetime import datetime

from core.saju import (
    calculate_day_pillar,
    calculate_hour_pillar,
    calculate_month_pillar,
    calculate_saju,
    calculate_year_pillar,
)


def test_calculate_year_pillar():
    result = calculate_year_pillar(datetime(2026, 7, 19, 12, 0))

    assert result.ganzhi == "병오"


def test_calculate_month_pillar():
    result = calculate_month_pillar(datetime(2026, 7, 19, 12, 0))

    assert result.ganzhi == "을미"


def test_calculate_day_pillar_reference_date():
    result = calculate_day_pillar(datetime(1949, 10, 1, 12, 0))

    assert result.ganzhi == "갑자"


def test_calculate_hour_pillar():
    result = calculate_hour_pillar(datetime(1949, 10, 1, 23, 30))

    assert result.ganzhi == "갑자"


def test_calculate_saju():
    result = calculate_saju(datetime(2026, 7, 19, 12, 0))

    assert result.year_pillar.ganzhi == "병오"
    assert result.month_pillar.ganzhi == "을미"
    assert result.day_pillar.ganzhi == "갑오"
    assert result.hour_pillar.ganzhi == "경오"