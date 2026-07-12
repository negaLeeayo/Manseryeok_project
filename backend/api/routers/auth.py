import os
from pathlib import Path
from urllib.parse import urlencode
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


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

    return {
        "message": "kakao login success",
        "user": {
            "provider": "kakao",
            "provider_user_id": kakao_id,
            "email": email,
            "nickname": nickname,
            "profile_image": profile_image,
        }
    }