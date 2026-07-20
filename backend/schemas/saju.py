from pydantic import BaseModel
from typing import Optional

# 요청 모델
class SajuRequest(BaseModel):
    birth: str          # 생년월일 (예: 1995-03-15)
    hour: int           # 태어난 시간 (0~23)
    gender: str         # 성별 (M/F)
    is_lunar: bool = False  # 음력 여부

# 기둥 모델 (년/월/일/시)
class Pillar(BaseModel):
    cheongan: str       # 천간 (갑/을/병...)
    jiji: str           # 지지 (자/축/인...)
    ohaeng: str         # 오행 (목/화/토/금/수)

# 오행 분포
class OhaengDistribution(BaseModel):
    mok: int            # 목
    hwa: int            # 화
    to: int             # 토
    geum: int           # 금
    su: int             # 수

# 대운
class Daewoon(BaseModel):
    age: int            # 시작 나이
    cheongan: str       # 천간
    jiji: str           # 지지
    ohaeng: str         # 오행

# 응답 모델
class SajuResponse(BaseModel):
    year_pillar: Optional[Pillar] = None    # 년주
    month_pillar: Optional[Pillar] = None   # 월주
    day_pillar: Optional[Pillar] = None     # 일주
    hour_pillar: Optional[Pillar] = None    # 시주
    ohaeng_dist: Optional[OhaengDistribution] = None  # 오행 분포
    daewoon_list: Optional[list[Daewoon]] = None      # 대운 목록
    message: Optional[str] = None