from backend.core.ganzhi import (
    get_stem,
    get_branch,
    get_ganzhi,
    get_ganzhi_cycle,
    get_year_ganzhi_by_year,
    get_ganzhi_detail,
)


def test_get_stem():
    assert get_stem(0) == "갑"
    assert get_stem(1) == "을"
    assert get_stem(9) == "계"
    assert get_stem(10) == "갑"


def test_get_branch():
    assert get_branch(0) == "자"
    assert get_branch(1) == "축"
    assert get_branch(11) == "해"
    assert get_branch(12) == "자"


def test_get_ganzhi():
    assert get_ganzhi(0) == "갑자"
    assert get_ganzhi(1) == "을축"
    assert get_ganzhi(59) == "계해"
    assert get_ganzhi(60) == "갑자"


def test_get_ganzhi_cycle():
    cycle = get_ganzhi_cycle()

    assert len(cycle) == 60
    assert cycle[0] == "갑자"
    assert cycle[1] == "을축"
    assert cycle[59] == "계해"

def test_get_year_ganzhi_by_year():
    assert get_year_ganzhi_by_year(1984) == "갑자"
    assert get_year_ganzhi_by_year(2000) == "경진"
    assert get_year_ganzhi_by_year(2024) == "갑진"
def test_get_ganzhi_detail():
    result = get_ganzhi_detail(0)

    assert result["index"] == 0
    assert result["stem"] == "갑"
    assert result["branch"] == "자"
    assert result["ganzhi"] == "갑자"

    result = get_ganzhi_detail(59)

    assert result["index"] == 59
    assert result["stem"] == "계"
    assert result["branch"] == "해"
    assert result["ganzhi"] == "계해"