from dataclasses import dataclass
from core.jeolgi import get_solar_longitude
from core.ganzhi import (
    get_ganzhi,
    get_stem_ohaeng,
    get_branch_ohaeng,
)
from datetime import datetime, timedelta

HEAVENLY_STEMS = [
    "갑", "을", "병", "정", "무",
    "기", "경", "신", "임", "계",
]

EARTHLY_BRANCHES = [
    "자", "축", "인", "묘", "진", "사",
    "오", "미", "신", "유", "술", "해",
]
YANG_STEMS = {"갑", "병", "무", "경", "임"}
YIN_STEMS = {"을", "정", "기", "신", "계"}
JEOLIP_LONGITUDES = {
    315: "입춘",
    345: "경칩",
    15: "청명",
    45: "입하",
    75: "망종",
    105: "소서",
    135: "입추",
    165: "백로",
    195: "한로",
    225: "입동",
    255: "대설",
    285: "소한",
}

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

def get_daewoon_direction(gender: str, year_stem: str) -> str:
    """
    성별과 연간의 음양을 기준으로 대운 방향을 반환한다.

    남자 + 양간 / 여자 + 음간: 순행
    남자 + 음간 / 여자 + 양간: 역행
    """
    normalized_gender = gender.strip().lower()

    gender_aliases = {
        "남": "male",
        "남자": "male",
        "male": "male",
        "m": "male",
        "여": "female",
        "여자": "female",
        "female": "female",
        "f": "female",
    }

    normalized_gender = gender_aliases.get(
        normalized_gender,
        normalized_gender,
    )

    if normalized_gender not in {"male", "female"}:
        raise ValueError("gender는 male 또는 female이어야 합니다.")

    if year_stem not in YANG_STEMS | YIN_STEMS:
        raise ValueError(f"유효하지 않은 연간입니다: {year_stem}")

    is_yang = year_stem in YANG_STEMS

    is_forward = (
        normalized_gender == "male" and is_yang
    ) or (
        normalized_gender == "female" and not is_yang
    )

    return "forward" if is_forward else "backward"

def _longitude_difference(
    current_longitude: float,
    target_longitude: float,
) -> float:
    """
    현재 황경에서 목표 황경까지 순방향 각도 차이를 계산한다.
    결과 범위는 0 이상 360 미만이다.
    """
    return (target_longitude - current_longitude) % 360

def _find_crossing_time(
    start: datetime,
    end: datetime,
    target_longitude: float,
) -> datetime:
    """
    start와 end 사이에서 태양 황경이 target_longitude를
    통과하는 시각을 이진 탐색으로 찾는다.
    """
    left = start
    right = end

    for _ in range(50):
        middle = left + (right - left) / 2

        left_longitude = get_solar_longitude(left)
        middle_longitude = get_solar_longitude(middle)

        left_to_target = _longitude_difference(
            left_longitude,
            target_longitude,
        )
        left_to_middle = _longitude_difference(
            left_longitude,
            middle_longitude,
        )

        if left_to_middle >= left_to_target:
            right = middle
        else:
            left = middle

    return left + (right - left) / 2

def find_reference_jeolip(
    birth_datetime: datetime,
    direction: str,
) -> tuple[str, datetime]:
    """
    순행이면 출생 이후의 다음 절입,
    역행이면 출생 이전의 직전 절입을 반환한다.
    """
    if direction not in {"forward", "backward"}:
        raise ValueError(
            "direction은 forward 또는 backward여야 합니다."
        )

    search_start = birth_datetime - timedelta(days=40)
    search_end = birth_datetime + timedelta(days=40)

    candidates: list[tuple[str, datetime]] = []

    current = search_start

    while current < search_end:
        next_time = current + timedelta(hours=6)

        start_longitude = get_solar_longitude(current)
        end_longitude = get_solar_longitude(next_time)

        movement = _longitude_difference(
            start_longitude,
            end_longitude,
        )

        for target_longitude, name in JEOLIP_LONGITUDES.items():
            distance = _longitude_difference(
                start_longitude,
                target_longitude,
            )

            if distance <= movement:
                crossing_time = _find_crossing_time(
                    current,
                    next_time,
                    target_longitude,
                )

                candidates.append(
                    (name, crossing_time)
                )

        current = next_time

    candidates.sort(key=lambda item: item[1])

    if direction == "forward":
        future_candidates = [
            item
            for item in candidates
            if item[1] >= birth_datetime
        ]

        if not future_candidates:
            raise ValueError(
                "출생 이후의 절입을 찾지 못했습니다."
            )

        return future_candidates[0]

    past_candidates = [
        item
        for item in candidates
        if item[1] <= birth_datetime
    ]

    if not past_candidates:
        raise ValueError(
            "출생 이전의 절입을 찾지 못했습니다."
        )

    return past_candidates[-1]

def calculate_jeolip_time_difference(
    birth_datetime: datetime,
    direction: str,
) -> dict:
    """
    출생 시각과 기준 절입 사이의 시간 차이를 계산한다.
    """
    jeolip_name, jeolip_datetime = find_reference_jeolip(
        birth_datetime=birth_datetime,
        direction=direction,
    )

    if direction == "forward":
        difference = jeolip_datetime - birth_datetime
    else:
        difference = birth_datetime - jeolip_datetime

    total_seconds = difference.total_seconds()
    total_days = total_seconds / 86400

    return {
        "jeolip_name": jeolip_name,
        "jeolip_datetime": jeolip_datetime,
        "difference_days": total_days,
        "difference_seconds": total_seconds,
    }

def convert_time_difference_to_start_age(
    difference_seconds: float,
) -> dict:
    """
    절입과 출생 시각의 차이를 대운 시작 나이로 변환한다.

    기준:
    3일 = 1년
    1일 = 4개월
    6시간 = 1개월
    """
    if difference_seconds < 0:
        raise ValueError("시간 차이는 0 이상이어야 합니다.")

    six_hours_seconds = 6 * 60 * 60

    total_months = round(
        difference_seconds / six_hours_seconds
    )

    years = total_months // 12
    months = total_months % 12

    return {
        "years": years,
        "months": months,
        "total_months": total_months,
        "display": (
            f"{years}년 {months}개월"
            if months > 0
            else f"{years}년"
        ),
    }

def generate_daewoon_list(
    month_stem: str,
    month_branch: str,
    direction: str,
    start_age_years: int,
    count: int = 8,
) -> list[dict]:
    """
    월주를 기준으로 10년 단위 대운 목록을 생성한다.

    순행: 월주 다음 간지부터 진행
    역행: 월주 이전 간지부터 진행
    """
    if direction not in {"forward", "backward"}:
        raise ValueError(
            "direction은 forward 또는 backward여야 합니다."
        )

    if month_stem not in HEAVENLY_STEMS:
        raise ValueError(f"유효하지 않은 월간입니다: {month_stem}")

    if month_branch not in EARTHLY_BRANCHES:
        raise ValueError(f"유효하지 않은 월지입니다: {month_branch}")

    if start_age_years < 0:
        raise ValueError("대운 시작 나이는 0 이상이어야 합니다.")

    stem_index = HEAVENLY_STEMS.index(month_stem)
    branch_index = EARTHLY_BRANCHES.index(month_branch)

    step = 1 if direction == "forward" else -1

    items = []

    for order in range(1, count + 1):
        current_stem_index = (
            stem_index + step * order
        ) % len(HEAVENLY_STEMS)

        current_branch_index = (
            branch_index + step * order
        ) % len(EARTHLY_BRANCHES)

        stem = HEAVENLY_STEMS[current_stem_index]
        branch = EARTHLY_BRANCHES[current_branch_index]

        item_start_age = start_age_years + (order - 1) * 10
        item_end_age = item_start_age + 9

        items.append(
            {
                "order": order,
                "start_age": item_start_age,
                "end_age": item_end_age,
                "stem": stem,
                "branch": branch,
                "pillar": stem + branch,
            }
        )

    return items

def calculate_daewoon(
    birth_datetime: datetime,
    gender: str,
    year_stem: str,
    month_stem: str,
    month_branch: str,
    count: int = 8,
) -> dict:
    """
    대운 방향, 기준 절입, 시작 나이,
    10년 단위 대운 목록을 한 번에 계산한다.
    """
    direction = get_daewoon_direction(
        gender=gender,
        year_stem=year_stem,
    )

    jeolip_difference = calculate_jeolip_time_difference(
        birth_datetime=birth_datetime,
        direction=direction,
    )

    start_age = convert_time_difference_to_start_age(
        jeolip_difference["difference_seconds"]
    )

    items = generate_daewoon_list(
        month_stem=month_stem,
        month_branch=month_branch,
        direction=direction,
        start_age_years=start_age["years"],
        count=count,
    )

    return {
        "direction": direction,
        "direction_label": (
            "순행" if direction == "forward" else "역행"
        ),
        "reference_jeolip": {
            "name": jeolip_difference["jeolip_name"],
            "datetime": jeolip_difference[
                "jeolip_datetime"
            ],
            "difference_days": jeolip_difference[
                "difference_days"
            ],
        },
        "start_age": start_age,
        "items": items,
    }

def calculate_daewoon_from_saju(
    birth_datetime: datetime,
    gender: str,
    saju_result,
    count: int = 8,
) -> dict:
    """
    사주 계산 결과에서 연간과 월주를 가져와
    대운을 자동으로 계산한다.
    """
    return calculate_daewoon(
        birth_datetime=birth_datetime,
        gender=gender,
        year_stem=saju_result.year_pillar.stem,
        month_stem=saju_result.month_pillar.stem,
        month_branch=saju_result.month_pillar.branch,
        count=count,
    )