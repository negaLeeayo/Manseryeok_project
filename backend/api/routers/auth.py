import os
import secrets
from pathlib import Path
from urllib.parse import urlencode
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Header, Request, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from jose import jwt

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import SocialAccount, User
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    if not secret_key:
        raise HTTPException(status_code=500, detail="JWT_SECRET_KEY is not set")

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(hours=1)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)

    return encoded_jwt
def verify_access_token(token: str | None):
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Access token is missing",
        )

    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    if not secret_key:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET_KEY is not set",
        )

    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[algorithm],
        )
        return payload

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )
@router.get("/test")
def auth_test():
    return {"message": "auth router works"}


@router.get("/kakao/login")
def kakao_login():
    kakao_rest_api_key = os.getenv("KAKAO_REST_API_KEY")
    kakao_redirect_uri = os.getenv("KAKAO_REDIRECT_URI")

    if not kakao_rest_api_key:
        raise HTTPException(
            status_code=500,
            detail="KAKAO_REST_API_KEY is not set"
        )

    if not kakao_redirect_uri:
        raise HTTPException(
            status_code=500,
            detail="KAKAO_REDIRECT_URI is not set"
        )

    # 로그인 요청마다 임의의 state 값 생성
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": kakao_rest_api_key,
        "redirect_uri": kakao_redirect_uri,
        "response_type": "code",
        "state": state,
    }

    kakao_auth_url = (
        "https://kauth.kakao.com/oauth/authorize?"
        + urlencode(params)
    )

    response = RedirectResponse(kakao_auth_url)

    # 콜백에서 비교하기 위해 state를 임시 쿠키에 저장
    response.set_cookie(
        key="kakao_oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=300,
    )

    return response

@router.get("/kakao/callback")
def kakao_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    saved_state = request.cookies.get("kakao_oauth_state")

    if not state or not saved_state:
        raise HTTPException(
            status_code=400,
            detail="OAuth state is missing",
        )

    if not secrets.compare_digest(state, saved_state):
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state",
        )

    if error:
        raise HTTPException(
            status_code=400,
            detail=f"Kakao login error: {error}",
        )

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Authorization code is missing",
        )

    kakao_rest_api_key = os.getenv("KAKAO_REST_API_KEY")
    kakao_redirect_uri = os.getenv("KAKAO_REDIRECT_URI")
    kakao_client_secret = os.getenv("KAKAO_CLIENT_SECRET")

    if not kakao_rest_api_key:
        raise HTTPException(
            status_code=500,
            detail="KAKAO_REST_API_KEY is not set",
        )

    if not kakao_redirect_uri:
        raise HTTPException(
            status_code=500,
            detail="KAKAO_REDIRECT_URI is not set",
        )

    token_url = "https://kauth.kakao.com/oauth/token"

    token_request_data = {
        "grant_type": "authorization_code",
        "client_id": kakao_rest_api_key,
        "redirect_uri": kakao_redirect_uri,
        "code": code,
    }

    if kakao_client_secret:
        token_request_data["client_secret"] = kakao_client_secret

    token_response = httpx.post(
        token_url,
        data=token_request_data,
        headers={
            "Content-Type":
                "application/x-www-form-urlencoded;charset=utf-8"
        },
    )

    if token_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to get Kakao access token",
                "kakao_response": token_response.json(),
            },
        )

    token_data = token_response.json()
    kakao_access_token = token_data.get("access_token")

    if not kakao_access_token:
        raise HTTPException(
            status_code=400,
            detail="Kakao access token is missing",
        )

    user_info_response = httpx.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={
            "Authorization": f"Bearer {kakao_access_token}",
        },
    )

    if user_info_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to get Kakao user info",
                "kakao_response": user_info_response.json(),
            },
        )

    user_info = user_info_response.json()

    kakao_id = user_info.get("id")
    kakao_account = user_info.get("kakao_account", {})
    profile = kakao_account.get("profile", {})

    email = kakao_account.get("email")
    nickname = profile.get("nickname")
    profile_image = profile.get("profile_image_url")

    if kakao_id is None:
        raise HTTPException(
            status_code=400,
            detail="Kakao user ID is missing",
        )

    user = get_or_create_kakao_user(
        db=db,
        kakao_id=str(kakao_id),
        email=email,
        nickname=nickname,
        profile_image=profile_image,
    )

    jwt_access_token = create_access_token(
        data={
            "user_id": user.id,
            "provider": "kakao",
            "provider_user_id": str(kakao_id),
            "email": email,
            "nickname": nickname,
            "profile_image": profile_image,
        },
        expires_delta=timedelta(hours=1),
    )

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )
    redirect_url = f"{frontend_url}/auth/success"

    redirect_response = RedirectResponse(
        url=redirect_url,
        status_code=307,
    )

    redirect_response.set_cookie(
        key="access_token",
        value=jwt_access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=3600,
        path="/",
    )

    redirect_response.delete_cookie(
        key="kakao_oauth_state",
        path="/",
    )

    return redirect_response

@router.get("/me")
def get_me(
    request: Request,
    authorization: str | None = Header(default=None),
):
    token = request.cookies.get("access_token")

    # 쿠키가 없으면 Authorization 헤더도 확인
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.removeprefix("Bearer ").strip()

    payload = verify_access_token(token)

    return {
        "message": "authenticated",
        "user": {
            "user_id": payload.get("user_id"),
            "provider": payload.get("provider"),
            "provider_user_id": payload.get("provider_user_id"),
            "email": payload.get("email"),
            "nickname": payload.get("nickname"),
            "profile_image": payload.get("profile_image"),
        },
    }
@router.post("/logout")
def logout():
    response = JSONResponse(
        content={
            "message": "logout success",
        }
    )

    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return response

def get_or_create_kakao_user(
    db: Session,
    kakao_id: str,
    email: str | None,
    nickname: str | None,
    profile_image: str | None,
) -> User:
    social_account = db.scalar(
        select(SocialAccount).where(
            SocialAccount.provider == "kakao",
            SocialAccount.provider_user_id == kakao_id,
        )
    )

    if social_account:
        user = social_account.user

        # 카카오에서 받은 최신 정보로 갱신
        user.email = email
        user.nickname = nickname
        user.profile_image = profile_image

        db.commit()
        db.refresh(user)

        return user

    try:
        user = User(
            email=email,
            nickname=nickname,
            profile_image=profile_image,
        )

        db.add(user)
        db.flush()

        social_account = SocialAccount(
            user_id=user.id,
            provider="kakao",
            provider_user_id=kakao_id,
        )

        db.add(social_account)
        db.commit()
        db.refresh(user)

        return user

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save Kakao user",
        )