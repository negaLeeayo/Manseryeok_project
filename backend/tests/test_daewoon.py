import pytest

from core.daewoon import (
    find_ganzhi_index,
    determine_daewoon_direction,
    calculate_daewoon,
)


def test_find_ganzhi_index():
    assert find_ganzhi_index("갑", "자") == 0
    assert find_ganzhi_index("을", "축") == 1
    assert find_ganzhi_index("계", "해") == 59


def test_find_ganzhi_index_rejects_invalid_combination():
    with pytest.raises(ValueError):
        find_ganzhi_index("갑", "축")


def test_yang_year_male_is_forward():
    result = determine_daewoon_direction(
        year_stem="갑",
        gender="M"
    )

    assert result == 1


def test_yang_year_female_is_backward():
    result = determine_daewoon_direction(
        year_stem="갑",
        gender="F"
    )

    assert result == -1


def test_yin_year_male_is_backward():
    result = determine_daewoon_direction(
        year_stem="을",
        gender="M"
    )

    assert result == -1


def test_yin_year_female_is_forward():
    result = determine_daewoon_direction(
        year_stem="을",
        gender="F"
    )

    assert result == 1


def test_calculate_daewoon_returns_requested_count():
    results = calculate_daewoon(
        month_stem="갑",
        month_branch="자",
        year_stem="갑",
        gender="M",
        start_age=1,
        count=8
    )

    assert len(results) == 8


def test_calculate_daewoon_age_increases_by_ten():
    results = calculate_daewoon(
        month_stem="갑",
        month_branch="자",
        year_stem="갑",
        gender="M",
        start_age=3,
        count=3
    )

    assert results[0].age == 3
    assert results[1].age == 13
    assert results[2].age == 23


def test_calculate_daewoon_forward_direction():
    results = calculate_daewoon(
        month_stem="갑",
        month_branch="자",
        year_stem="갑",
        gender="M",
        start_age=1,
        count=2
    )

    assert results[0].cheongan == "을"
    assert results[0].jiji == "축"

    assert results[1].cheongan == "병"
    assert results[1].jiji == "인"


def test_calculate_daewoon_backward_direction():
    results = calculate_daewoon(
        month_stem="갑",
        month_branch="자",
        year_stem="을",
        gender="M",
        start_age=1,
        count=2
    )

    assert results[0].cheongan == "계"
    assert results[0].jiji == "해"

    assert results[1].cheongan == "임"
    assert results[1].jiji == "술"


def test_calculate_daewoon_rejects_invalid_count():
    with pytest.raises(ValueError):
        calculate_daewoon(
            month_stem="갑",
            month_branch="자",
            year_stem="갑",
            gender="M",
            start_age=1,
            count=0
        )


def test_calculate_daewoon_rejects_invalid_age():
    with pytest.raises(ValueError):
        calculate_daewoon(
            month_stem="갑",
            month_branch="자",
            year_stem="갑",
            gender="M",
            start_age=-1,
            count=8
        )