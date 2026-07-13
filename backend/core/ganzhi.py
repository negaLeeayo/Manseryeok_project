HEAVENLY_STEMS = [
    "갑", "을", "병", "정", "무",
    "기", "경", "신", "임", "계"
]

EARTHLY_BRANCHES = [
    "자", "축", "인", "묘", "진", "사",
    "오", "미", "신", "유", "술", "해"
]


def get_stem(index: int) -> str:
    """
    인덱스에 해당하는 천간을 반환한다.
    0 -> 갑, 1 -> 을, ..., 9 -> 계
    """

    return HEAVENLY_STEMS[index % 10]


def get_branch(index: int) -> str:
    """
    인덱스에 해당하는 지지를 반환한다.
    0 -> 자, 1 -> 축, ..., 11 -> 해
    """

    return EARTHLY_BRANCHES[index % 12]


def get_ganzhi(index: int) -> str:
    """
    60갑자 인덱스에 해당하는 간지를 반환한다.
    0 -> 갑자, 1 -> 을축, ..., 59 -> 계해
    """

    stem = get_stem(index)
    branch = get_branch(index)

    return stem + branch
def get_ganzhi_cycle() -> list[str]:
    """
    60갑자 전체 목록을 반환한다.
    0: 갑자
    1: 을축
    ...
    59: 계해
    """

    cycle = []

    for index in range(60):
        cycle.append(get_ganzhi(index))

    return cycle
def get_year_ganzhi_by_year(year: int) -> str:
    """
    양력 연도 기준으로 해당 연도의 간지를 반환한다.

    기준:
    1984년 = 갑자
    """

    base_year = 1984  # 갑자년
    index = year - base_year

    return get_ganzhi(index)
def get_ganzhi_detail(index: int) -> dict:
    """
    60갑자 인덱스에 해당하는 간지를 상세 정보로 반환한다.
    """

    stem = get_stem(index)
    branch = get_branch(index)

    return {
        "index": index % 60,
        "stem": stem,
        "branch": branch,
        "ganzhi": stem + branch
    }