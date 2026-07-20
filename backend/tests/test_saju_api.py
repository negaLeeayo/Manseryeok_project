from fastapi.testclient import TestClient

from api.main import app


client = TestClient(app)


def test_get_saju_with_solar_date():
    response = client.get(
        "/saju/",
        params={
            "birth": "2026-07-19",
            "hour": 12,
            "gender": "M",
            "is_lunar": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["year_pillar"]["cheongan"] == "병"
    assert data["year_pillar"]["jiji"] == "오"

    assert data["month_pillar"]["cheongan"] == "을"
    assert data["month_pillar"]["jiji"] == "미"

    assert data["day_pillar"]["cheongan"] == "갑"
    assert data["day_pillar"]["jiji"] == "오"

    assert data["hour_pillar"]["cheongan"] == "경"
    assert data["hour_pillar"]["jiji"] == "오"

    assert data["ohaeng_dist"] == {
        "mok": 2,
        "hwa": 4,
        "to": 1,
        "geum": 1,
        "su": 0,
    }


def test_get_saju_rejects_invalid_hour():
    response = client.get(
        "/saju/",
        params={
            "birth": "2026-07-19",
            "hour": 25,
            "gender": "M",
            "is_lunar": False,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "hour는 0 이상 23 이하여야 합니다."
    )


def test_get_saju_rejects_invalid_gender():
    response = client.get(
        "/saju/",
        params={
            "birth": "2026-07-19",
            "hour": 12,
            "gender": "X",
            "is_lunar": False,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "gender는 M 또는 F여야 합니다."
    )


def test_get_saju_rejects_invalid_date():
    response = client.get(
        "/saju/",
        params={
            "birth": "2026-02-30",
            "hour": 12,
            "gender": "M",
            "is_lunar": False,
        },
    )

    assert response.status_code == 400
def test_post_saju_calculate():
    response = client.post(
        "/saju/calculate",
        json={
            "birth": "2026-07-19",
            "hour": 12,
            "gender": "M",
            "is_lunar": False
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["year_pillar"]["cheongan"] == "병"
    assert data["year_pillar"]["jiji"] == "오"

    assert data["month_pillar"]["cheongan"] == "을"
    assert data["month_pillar"]["jiji"] == "미"

    assert data["day_pillar"]["cheongan"] == "갑"
    assert data["day_pillar"]["jiji"] == "오"

    assert data["hour_pillar"]["cheongan"] == "경"
    assert data["hour_pillar"]["jiji"] == "오"

    assert data["ohaeng_dist"] == {
        "mok": 2,
        "hwa": 4,
        "to": 1,
        "geum": 1,
        "su": 0
    }

    assert data["daewoon_list"] is not None
    assert len(data["daewoon_list"]) == 8

    assert data["daewoon_list"][0]["age"] == 1
    assert data["daewoon_list"][1]["age"] == 11
    assert data["daewoon_list"][2]["age"] == 21

    assert "cheongan" in data["daewoon_list"][0]
    assert "jiji" in data["daewoon_list"][0]
    assert "ohaeng" in data["daewoon_list"][0]

def test_post_saju_rejects_invalid_hour():
    response = client.post(
        "/saju/calculate",
        json={
            "birth": "2026-07-19",
            "hour": 25,
            "gender": "M",
            "is_lunar": False
        }
    )

    assert response.status_code == 400


def test_post_saju_rejects_invalid_gender():
    response = client.post(
        "/saju/calculate",
        json={
            "birth": "2026-07-19",
            "hour": 12,
            "gender": "X",
            "is_lunar": False
        }
    )

    assert response.status_code == 400


def test_post_saju_rejects_invalid_date():
    response = client.post(
        "/saju/calculate",
        json={
            "birth": "2026-02-30",
            "hour": 12,
            "gender": "M",
            "is_lunar": False
        }
    )

    assert response.status_code == 400