# 앱 이름 미정🌙

> 사주/만세력 서비스

## 📱 소개
()은 사주팔자, 오늘의 운세, 대운/세운 타임라인을 제공하는 동양 천문학 기반 운세 앱입니다.

## 🛠️ 기술 스택
| 구분 | 기술 |
|------|------|
| 프론트엔드 | React |
| 백엔드 | FastAPI |
| 천문 계산 | ephem |
| 음력/절기 | 한국천문연구원 API |

## 📁 프로젝트 구조
Manseryeok_project/
├── backend/
│   ├── api/
│   │   ├── main.py
│   │   └── routers/
│   │       ├── saju.py
│   │       ├── jeolgi.py
│   │       └── lunar.py
│   ├── core/           # 계산 엔진
│   ├── schemas/
│   ├── .env.example
│   └── requirements.txt
└── frontend/
└── src/
├── components/
├── pages/
└── api/

## 🚀 로컬 실행 방법

### 백엔드
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn api.main:app --reload
```

### 프론트엔드
```bash
cd frontend
npm install
npm start
```

## 👥 역할 분담
| 담당 | 이름 |
|------|------|
| 프론트엔드 + API 라우터 | 가 |
| 백엔드 계산 엔진 (core/) | 신 |

## ✨ 주요 기능
- 🔮 만세력 (사주팔자 계산)
- 🌙 오늘의 운세
- 📅 대운/세운 타임라인
- 💾 내 사주 저장 & 히스토리