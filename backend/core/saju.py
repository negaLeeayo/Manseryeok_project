from dataclasses import dataclass
from datetime import datetime

from core.jeolgi import get_solar_longitude

HEAVENLY_STEMS = [
    "갑", "을", "병", "정", "무",
    "기", "경", "신", "임", "계",
]

EARTHLY_BRANCHES = [
    "자", "축", "인", "묘", "진", "사",
    "오", "미", "신", "유", "술", "해",
]


@dataclass
class Pillar:
    stem: str
    branch: str

    @property
    def ganzhi(self) -> str:
        return f"{self.stem}{self.branch}"


@dataclass
class SajuResult:
    year_pillar: Pillar
    month_pillar: Pillar
    day_pillar: Pillar
    hour_pillar: Pillar

def calculate_year_pillar(birth_datetime: datetime) -> Pillar:
    """
    입춘을 기준으로 연주를 계산한다.
    """
    if not isinstance(birth_datetime, datetime):
        raise TypeError("birth_datetime은 datetime 객체여야 합니다.")

    longitude = get_solar_longitude(birth_datetime)
    effective_year = birth_datetime.year

    # 1~2월 중 입춘(황경 315도) 이전이면 이전 해로 계산
    if birth_datetime.month in (1, 2) and longitude < 315:
        effective_year -= 1

    cycle_index = (effective_year - 1984) % 60

    stem = HEAVENLY_STEMS[cycle_index % 10]
    branch = EARTHLY_BRANCHES[cycle_index % 12]

    return Pillar(stem=stem, branch=branch)

def calculate_saju(birth_datetime: datetime) -> SajuResult:
    """
    생년월일시를 기준으로 연주, 월주, 일주, 시주를 계산한다.
    """
    if not isinstance(birth_datetime, datetime):
        raise TypeError("birth_datetime은 datetime 객체여야 합니다.")

    year_pillar = calculate_year_pillar(birth_datetime)
    month_pillar = calculate_month_pillar(birth_datetime)
    day_pillar = calculate_day_pillar(birth_datetime)
    hour_pillar = calculate_hour_pillar(birth_datetime)

    return SajuResult(
        year_pillar=year_pillar,
        month_pillar=month_pillar,
        day_pillar=day_pillar,
        hour_pillar=hour_pillar,
    )
def calculate_month_pillar(birth_datetime: datetime) -> Pillar:
    """
    태양 황경과 연간을 기준으로 월주를 계산한다.
    """
    if not isinstance(birth_datetime, datetime):
        raise TypeError("birth_datetime은 datetime 객체여야 합니다.")

    longitude = get_solar_longitude(birth_datetime)

    # 입춘 315도를 첫 번째 달인 인월로 설정
    month_offset = int(((longitude - 315) % 360) // 30)

    # 인(2)부터 시작해서 12지지를 순환
    branch_index = (2 + month_offset) % 12
    branch = EARTHLY_BRANCHES[branch_index]

    year_pillar = calculate_year_pillar(birth_datetime)
    year_stem_index = HEAVENLY_STEMS.index(year_pillar.stem)

    # 갑·기년은 병인월부터 시작하고,
    # 이후 연간에 따라 첫 월간이 두 칸씩 이동
    first_month_stem_index = ((year_stem_index % 5) * 2 + 2) % 10
    month_stem_index = (first_month_stem_index + month_offset) % 10

    stem = HEAVENLY_STEMS[month_stem_index]

    return Pillar(stem=stem, branch=branch)

def make_sexagenary_cycle() -> list[tuple[str, str]]:
    """
    천간과 지지를 순서대로 결합해 60갑자 목록을 만든다.
    """
    return [
        (
            HEAVENLY_STEMS[index % 10],
            EARTHLY_BRANCHES[index % 12],
        )
        for index in range(60)
    ]


SEXAGENARY_CYCLE = make_sexagenary_cycle()

def calculate_day_pillar(birth_datetime: datetime) -> Pillar:
    """
    생년월일을 기준으로 일주를 계산한다.

    기준일:
        1949년 10월 1일 = 갑자일
    """
    if not isinstance(birth_datetime, datetime):
        raise TypeError("birth_datetime은 datetime 객체여야 합니다.")

    reference_date = datetime(1949, 10, 1).date()
    birth_date = birth_datetime.date()

    days_difference = (birth_date - reference_date).days
    cycle_index = days_difference % 60

    stem, branch = SEXAGENARY_CYCLE[cycle_index]

    return Pillar(stem=stem, branch=branch)

def calculate_day_pillar(birth_datetime: datetime) -> Pillar:
    if not isinstance(birth_datetime, datetime):
        raise TypeError("birth_datetime은 datetime 객체여야 합니다.")

    reference_date = datetime(1949, 10, 1).date()
    birth_date = birth_datetime.date()

    days_difference = (birth_date - reference_date).days
    cycle_index = days_difference % 60

    stem, branch = SEXAGENARY_CYCLE[cycle_index]

    return Pillar(stem=stem, branch=branch)

def calculate_hour_pillar(birth_datetime: datetime) -> Pillar:
    """
    생년월일시를 기준으로 시주를 계산한다.

    지지는 2시간 단위로 계산하고,
    천간은 일간을 기준으로 결정한다.
    """
    if not isinstance(birth_datetime, datetime):
        raise TypeError("birth_datetime은 datetime 객체여야 합니다.")

    hour = birth_datetime.hour

    # 23시와 0시는 자시가 되도록 처리
    branch_index = ((hour + 1) // 2) % 12
    branch = EARTHLY_BRANCHES[branch_index]

    day_pillar = calculate_day_pillar(birth_datetime)
    day_stem_index = HEAVENLY_STEMS.index(day_pillar.stem)

    # 갑·기일은 갑자시부터 시작하고
    # 일간에 따라 자시 천간이 두 칸씩 이동
    first_hour_stem_index = (day_stem_index % 5) * 2

    hour_stem_index = (
        first_hour_stem_index + branch_index
    ) % 10

    stem = HEAVENLY_STEMS[hour_stem_index]

    return Pillar(stem=stem, branch=branch)