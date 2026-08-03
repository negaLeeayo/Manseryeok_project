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

STEM_OHAENG = {
    "갑": "목",
    "을": "목",
    "병": "화",
    "정": "화",
    "무": "토",
    "기": "토",
    "경": "금",
    "신": "금",
    "임": "수",
    "계": "수",
}


BRANCH_OHAENG = {
    "자": "수",
    "축": "토",
    "인": "목",
    "묘": "목",
    "진": "토",
    "사": "화",
    "오": "화",
    "미": "토",
    "신": "금",
    "유": "금",
    "술": "토",
    "해": "수",
}


def get_stem_ohaeng(stem: str) -> str:
    """
    천간에 해당하는 오행을 반환한다.

    예:
        갑 -> 목
        병 -> 화
        경 -> 금
    """

    if stem not in STEM_OHAENG:
        raise ValueError(f"유효하지 않은 천간입니다: {stem}")

    return STEM_OHAENG[stem]


def get_branch_ohaeng(branch: str) -> str:
    """
    지지에 해당하는 오행을 반환한다.

    예:
        자 -> 수
        인 -> 목
        오 -> 화
    """

    if branch not in BRANCH_OHAENG:
        raise ValueError(f"유효하지 않은 지지입니다: {branch}")

    return BRANCH_OHAENG[branch]

def calculate_ohaeng_distribution(pillars: list) -> dict:
    """
    사주 기둥들의 천간과 지지를 기준으로
    오행 분포를 계산한다.

    기둥 4개를 전달하면
    천간 4개 + 지지 4개, 총 8글자의 오행을 센다.

    Args:
        pillars:
            stem과 branch 속성을 가진 사주 기둥 객체 목록

    Returns:
        목, 화, 토, 금, 수의 개수를 담은 딕셔너리
    """

    counts = {
        "mok": 0,
        "hwa": 0,
        "to": 0,
        "geum": 0,
        "su": 0,
    }

    ohaeng_key_map = {
        "목": "mok",
        "화": "hwa",
        "토": "to",
        "금": "geum",
        "수": "su",
    }

    for pillar in pillars:
        stem_ohaeng = get_stem_ohaeng(pillar.stem)
        branch_ohaeng = get_branch_ohaeng(pillar.branch)

        counts[
            ohaeng_key_map[stem_ohaeng]
        ] += 1

        counts[
            ohaeng_key_map[branch_ohaeng]
        ] += 1

    return counts
