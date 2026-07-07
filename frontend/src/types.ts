export type Gender = "female" | "male" | "other";
export type CalendarType = "solar" | "lunar";
export type FlowStep = "splash" | "onboarding" | "consent" | "profile" | "home";

export type UserProfile = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: Gender;
  calendarType: CalendarType;
};

export type Pillar = {
  label: "년주" | "월주" | "일주" | "시주";
  cheongan: string;
  jiji: string;
  element: ElementKey;
};

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

export type ElementBalance = Record<ElementKey, number>;

export type Fortune = {
  total: string;
  money: string;
  love: string;
  health: string;
  iljin: string;
};

export type DaewoonItem = {
  age: number;
  label: string;
  element: ElementKey;
  summary: string;
  active?: boolean;
};

export type SajuSummary = {
  pillars: Pillar[];
  elements: ElementBalance;
  luckyColor: string;
  jeolgiNote: string;
  today: Fortune;
  daewoon: DaewoonItem[];
};
