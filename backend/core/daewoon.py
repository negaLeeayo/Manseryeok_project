from dataclasses import dataclass

from core.ganzhi import (
    get_ganzhi,
    get_stem_ohaeng,
    get_branch_ohaeng,
)


YANG_STEMS = {"갑", "병", "무", "경", "임"}
YIN_STEMS = {"을", "정", "기", "신", "계"}


@dataclass
class DaewoonResult:
    age: int
    cheongan: str
    jiji: str
    ohaeng: str


def find_ganzhi_index(cheongan: str, jiji: str) -> int:
    """
    천간과 지지를 받아 60갑자 인덱스를 찾는다.

    예:
        갑자 -> 0
        을축 -> 1
        병인 -> 2
    """

    target = cheongan + jiji

    for index in range(60):
        if get_ganzhi(index) == target:
            return index

    raise ValueError(
        f"올바른 60갑자 조합이 아닙니다: {cheongan}{jiji}"
    )


def determine_daewoon_direction(
    year_stem: str,
    gender: str
) -> int:
    """
    성별과 연간의 음양에 따라 대운의 진행 방향을 결정한다.

    반환값:
        1  -> 순행
        -1 -> 역행

    기본 규칙:
        양년생 남자 -> 순행
        음년생 여자 -> 순행
        음년생 남자 -> 역행
        양년생 여자 -> 역행
    """

    gender = gender.upper()

    if gender not in {"M", "F"}:
        raise ValueError("gender는 M 또는 F여야 합니다.")

    if year_stem not in YANG_STEMS and year_stem not in YIN_STEMS:
        raise ValueError(f"올바르지 않은 천간입니다: {year_stem}")

    is_yang_year = year_stem in YANG_STEMS

    if gender == "M":
        return 1 if is_yang_year else -1

    return -1 if is_yang_year else 1


def calculate_daewoon(
    month_stem: str,
    month_branch: str,
    year_stem: str,
    gender: str,
    start_age: int = 1,
    count: int = 8
) -> list[DaewoonResult]:
    """
    월주를 기준으로 대운 목록을 계산한다.

    Args:
        month_stem:
            월주의 천간

        month_branch:
            월주의 지지

        year_stem:
            연주의 천간

        gender:
            M 또는 F

        start_age:
            첫 번째 대운 시작 나이.
            현재 1차 구현에서는 기본값으로 1을 사용한다.

        count:
            반환할 대운 개수

    Returns:
        10년 단위 대운 목록
    """

    if start_age < 0:
        raise ValueError("시작 나이는 0 이상이어야 합니다.")

    if count <= 0:
        raise ValueError("대운 개수는 1 이상이어야 합니다.")

    month_index = find_ganzhi_index(
        cheongan=month_stem,
        jiji=month_branch
    )

    direction = determine_daewoon_direction(
        year_stem=year_stem,
        gender=gender
    )

    results = []

    for i in range(count):
        # 월주 다음 간지부터 첫 번째 대운으로 사용
        ganzhi_index = month_index + direction * (i + 1)
        ganzhi = get_ganzhi(ganzhi_index)

        cheongan = ganzhi[0]
        jiji = ganzhi[1]

        stem_ohaeng = get_stem_ohaeng(cheongan)
        branch_ohaeng = get_branch_ohaeng(jiji)

        results.append(
            DaewoonResult(
                age=start_age + i * 10,
                cheongan=cheongan,
                jiji=jiji,
                ohaeng=f"{stem_ohaeng}/{branch_ohaeng}"
            )
        )

    return results