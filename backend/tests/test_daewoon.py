from datetime import datetime

from core.daewoon import (
    calculate_daewoon,
    convert_time_difference_to_start_age,
    generate_daewoon_list,
    get_daewoon_direction,
)


def test_daewoon_direction():
    assert get_daewoon_direction("male", "갑") == "forward"
    assert get_daewoon_direction("male", "을") == "backward"
    assert get_daewoon_direction("female", "갑") == "backward"
    assert get_daewoon_direction("female", "을") == "forward"


def test_convert_time_difference_to_start_age():
    # 18일 = 6년
    result = convert_time_difference_to_start_age(
        18 * 24 * 60 * 60
    )

    assert result["years"] == 6
    assert result["months"] == 0
    assert result["total_months"] == 72
    assert result["display"] == "6년"


def test_generate_daewoon_list_forward():
    items = generate_daewoon_list(
        month_stem="을",
        month_branch="미",
        direction="forward",
        start_age_years=6,
        count=3,
    )

    assert len(items) == 3
    assert items[0]["pillar"] == "병신"
    assert items[0]["start_age"] == 6
    assert items[0]["end_age"] == 15
    assert items[1]["pillar"] == "정유"
    assert items[2]["pillar"] == "무술"


def test_generate_daewoon_list_backward():
    items = generate_daewoon_list(
        month_stem="을",
        month_branch="미",
        direction="backward",
        start_age_years=6,
        count=3,
    )

    assert len(items) == 3
    assert items[0]["pillar"] == "갑오"
    assert items[1]["pillar"] == "계사"
    assert items[2]["pillar"] == "임진"


def test_calculate_daewoon():
    result = calculate_daewoon(
        birth_datetime=datetime(2003, 1, 17, 14, 0),
        gender="male",
        year_stem="임",
        month_stem="계",
        month_branch="축",
        count=3,
    )

    assert result["direction"] == "forward"
    assert result["direction_label"] == "순행"
    assert result["reference_jeolip"]["name"] == "입춘"
    assert result["start_age"]["years"] == 6
    assert len(result["items"]) == 3
    assert result["items"][0]["pillar"] == "갑인"