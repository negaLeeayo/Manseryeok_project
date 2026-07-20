from datetime import datetime

from core.jeolgi import get_jeolgi_name, get_solar_longitude


def test_solar_longitude_range():
    dt = datetime(2026, 3, 21, 0, 0)

    longitude = get_solar_longitude(dt)

    assert 0 <= longitude < 360


def test_before_spring_equinox():
    dt = datetime(2026, 3, 20, 12, 0)

    result = get_jeolgi_name(dt)

    assert result == "경칩"


def test_after_spring_equinox():
    dt = datetime(2026, 3, 21, 0, 0)

    result = get_jeolgi_name(dt)

    assert result == "춘분"