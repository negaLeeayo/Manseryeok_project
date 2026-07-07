import type { SajuSummary, UserProfile } from "../types";

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function createMockProfile(profile: UserProfile): Promise<UserProfile> {
  await delay(350);
  return profile;
}

export async function getMockSajuSummary(): Promise<SajuSummary> {
  await delay(450);

  return {
    pillars: [
      { label: "년주", cheongan: "갑", jiji: "술", element: "wood" },
      { label: "월주", cheongan: "병", jiji: "인", element: "fire" },
      { label: "일주", cheongan: "경", jiji: "자", element: "metal" },
      { label: "시주", cheongan: "임", jiji: "오", element: "water" },
    ],
    elements: {
      wood: 3,
      fire: 2,
      earth: 1,
      metal: 2,
      water: 2,
    },
    luckyColor: "차분한 금빛 아이보리",
    jeolgiNote: "월주는 절기 기준으로 산정되며, 입춘 전후 출생자는 해석이 달라질 수 있어요.",
    today: {
      total: "정리되지 않은 생각을 하나로 묶기 좋은 날",
      money: "작은 지출을 기록하면 흐름이 보입니다.",
      love: "먼저 안부를 묻는 말이 부드럽게 닿아요.",
      health: "몸을 따뜻하게 하고 수면 리듬을 지켜보세요.",
      iljin: "계묘",
    },
    daewoon: [
      { age: 7, label: "정축", element: "earth", summary: "기초를 다지는 흐름" },
      { age: 17, label: "무인", element: "wood", summary: "새로운 관계와 배움" },
      { age: 27, label: "기묘", element: "wood", summary: "방향을 고르는 시기", active: true },
      { age: 37, label: "경진", element: "metal", summary: "성과를 구조화하는 운" },
      { age: 47, label: "신사", element: "fire", summary: "표현과 확장의 기운" },
    ],
  };
}
