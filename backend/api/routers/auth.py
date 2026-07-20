import os
from pathlib import Path
from urllib.parse import urlencode
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import RedirectResponse
from jose import jwt

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
def verify_access_token(authorization: str | None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.replace("Bearer ", "")

    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    if not secret_key:
        raise HTTPException(status_code=500, detail="JWT_SECRET_KEY is not set")

    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
@router.get("/test")
def auth_test():
    return {"message": "auth router works"}


@router.get("/kakao/login")
def kakao_login():
    kakao_rest_api_key = os.getenv("KAKAO_REST_API_KEY")
    kakao_redirect_uri = os.getenv("KAKAO_REDIRECT_URI")

    if not kakao_rest_api_key:
        raise HTTPException(status_code=500, detail="KAKAO_REST_API_KEY is not set")

    if not kakao_redirect_uri:
        raise HTTPException(status_code=500, detail="KAKAO_REDIRECT_URI is not set")

    params = {
        "client_id": kakao_rest_api_key,
        "redirect_uri": kakao_redirect_uri,
        "response_type": "code",
    }

    kakao_auth_url = "https://kauth.kakao.com/oauth/authorize?" + urlencode(params)

    return RedirectResponse(kakao_auth_url)
@router.get("/kakao/callback")
def kakao_callback(code: str | None = None, error: str | None = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Kakao login error: {error}")

    if not code:
        raise HTTPException(status_code=400, detail="Authorization code is missing")

    kakao_rest_api_key = os.getenv("KAKAO_REST_API_KEY")
    kakao_redirect_uri = os.getenv("KAKAO_REDIRECT_URI")
    kakao_client_secret = os.getenv("KAKAO_CLIENT_SECRET")

    if not kakao_rest_api_key:
        raise HTTPException(status_code=500, detail="KAKAO_REST_API_KEY is not set")

    if not kakao_redirect_uri:
        raise HTTPException(status_code=500, detail="KAKAO_REDIRECT_URI is not set")

    token_url = "https://kauth.kakao.com/oauth/token"

    data = {
        "grant_type": "authorization_code",
        "client_id": kakao_rest_api_key,
        "redirect_uri": kakao_redirect_uri,
        "code": code,
    }

    if kakao_client_secret:
        data["client_secret"] = kakao_client_secret

    headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }

    response = httpx.post(token_url, data=data, headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to get Kakao access token",
                "kakao_response": response.json()
            }
        )

    token_data = response.json()

    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail="Kakao access token is missing"
        )

    user_info_url = "https://kapi.kakao.com/v2/user/me"

    user_info_response = httpx.get(
        user_info_url,
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    if user_info_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to get Kakao user info",
                "kakao_response": user_info_response.json()
            }
        )

    user_info = user_info_response.json()

    kakao_id = user_info.get("id")
    kakao_account = user_info.get("kakao_account", {})
    profile = kakao_account.get("profile", {})

    email = kakao_account.get("email")
    nickname = profile.get("nickname")
    profile_image = profile.get("profile_image_url")

    access_token = create_access_token(
    data={
        "provider": "kakao",
        "provider_user_id": str(kakao_id),
        "email": email,
    },
    expires_delta=timedelta(hours=1)
)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    redirect_url = f"{frontend_url}/auth/success?access_token={access_token}"
    return RedirectResponse(redirect_url)
   
@router.get("/me")
def get_me(authorization: str | None = Header(default=None)):
    payload = verify_access_token(authorization)

    return {
        "message": "authenticated",
        "user": {
            "provider": payload.get("provider"),
            "provider_user_id": payload.get("provider_user_id"),
            "email": payload.get("email"),
        }
    }
@router.post("/logout")
def logout():
    return {
        "message": "logout success"
        }