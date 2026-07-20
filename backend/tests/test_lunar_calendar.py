import pytest

from backend.core.lunar_calendar import normalize_birth_date


def test_solar_date_returns_same_date():
    result = normalize_birth_date(
        year=2000,
        month=1,
        day=1,
        calendar_type="solar"
    )

    assert result["solar_year"] == 2000
    assert result["solar_month"] == 1
    assert result["solar_day"] == 1
    assert result["calendar_type"] == "solar"
    assert result["is_converted"] is False


def test_lunar_date_converts_to_solar_date():
    result = normalize_birth_date(
        year=2000,
        month=1,
        day=1,
        calendar_type="lunar"
    )

    assert result["solar_year"] == 2000
    assert result["solar_month"] == 2
    assert result["solar_day"] == 5
    assert result["calendar_type"] == "lunar"
    assert result["is_converted"] is True


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