import { FormEvent, useEffect, useMemo, useState } from "react";
import { createMockProfile, getMockSajuSummary } from "./api/mockApi";
import type { CalendarType, ElementKey, FlowStep, Gender, SajuSummary, UserProfile } from "./types";

const elementMeta: Record<ElementKey, { name: string; symbol: string; color: string }> = {
  wood: { name: "목", symbol: "나무", color: "#2D6A4F" },
  fire: { name: "화", symbol: "불", color: "#9B2335" },
  earth: { name: "토", symbol: "흙", color: "#D4A017" },
  metal: { name: "금", symbol: "쇠", color: "#8A9BA8" },
  water: { name: "수", symbol: "물", color: "#1B3A6B" },
};

const onboarding = [
  {
    title: "별의 결을 따라 읽는 사주",
    body: "동양 사주와 우주적인 무드를 함께 담아 나의 흐름을 차분하게 보여줘요.",
  },
  {
    title: "오늘의 운세를 한눈에",
    body: "총운, 재물운, 애정운, 건강운을 매일의 리듬에 맞춰 요약해요.",
  },
  {
    title: "대운과 세운의 타임라인",
    body: "인생의 큰 흐름과 매년의 변화를 시각적으로 따라갈 수 있어요.",
  },
];

const initialProfile: UserProfile = {
  name: "현",
  birthDate: "1998-03-21",
  birthTime: "09:30",
  gender: "female",
  calendarType: "solar",
};

export default function App() {
  const [step, setStep] = useState<FlowStep>("splash");
  const [slide, setSlide] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<SajuSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setStep("onboarding"), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const nextProfile = await createMockProfile(profile);
    const nextSummary = await getMockSajuSummary();
    setSavedProfile(nextProfile);
    setSummary(nextSummary);
    setIsLoading(false);
    setStep("home");
  }

  const content = useMemo(() => {
    if (step === "splash") {
      return <SplashScreen />;
    }

    if (step === "onboarding") {
      return (
        <OnboardingScreen
          activeIndex={slide}
          onNext={() => {
            if (slide === onboarding.length - 1) {
              setStep("consent");
              return;
            }
            setSlide((current) => current + 1);
          }}
          onSkip={() => setStep("consent")}
        />
      );
    }

    if (step === "consent") {
      return <ConsentScreen onAgree={() => setStep("profile")} />;
    }

    if (step === "profile") {
      return (
        <ProfileScreen
          profile={profile}
          isLoading={isLoading}
          onChange={setProfile}
          onSubmit={submitProfile}
        />
      );
    }

    return <HomeScreen profile={savedProfile ?? profile} summary={summary} onEdit={() => setStep("profile")} />;
  }, [isLoading, profile, savedProfile, slide, step, summary]);

  return (
    <main className="app-shell">
      <div className="stars" />
      {content}
    </main>
  );
}

function SplashScreen() {
  return (
    <section className="screen splash-screen" aria-label="스플래시">
      <BrandMark large />
      <h1>운결</h1>
      <p>별과 운명의 흐름을 잇다</p>
    </section>
  );
}

function OnboardingScreen({
  activeIndex,
  onNext,
  onSkip,
}: {
  activeIndex: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const current = onboarding[activeIndex];

  return (
    <section className="screen onboarding-screen">
      <header className="top-bar">
        <BrandMark />
        <button className="ghost-button" type="button" onClick={onSkip}>
          건너뛰기
        </button>
      </header>
      <div className="cosmic-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="copy-block">
        <p className="eyebrow">ONBOARDING {activeIndex + 1}/3</p>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
      </div>
      <footer className="bottom-actions">
        <div className="pagination" aria-label="온보딩 진행 상태">
          {onboarding.map((item, index) => (
            <span key={item.title} className={index === activeIndex ? "active" : ""} />
          ))}
        </div>
        <button className="primary-button" type="button" onClick={onNext}>
          {activeIndex === onboarding.length - 1 ? "시작하기" : "다음"}
        </button>
      </footer>
    </section>
  );
}

function ConsentScreen({ onAgree }: { onAgree: () => void }) {
  const [checked, setChecked] = useState({
    privacy: false,
    profile: false,
    marketing: false,
  });
  const requiredChecked = checked.privacy && checked.profile;

  return (
    <section className="screen consent-screen">
      <header className="top-bar">
        <BrandMark />
      </header>
      <div className="copy-block compact">
        <p className="eyebrow">CONSENT</p>
        <h2>나의 사주 정보를 안전하게 다룰게요</h2>
        <p>생년월일, 태어난 시간, 성별 정보는 만세력 계산과 운세 카드 제공에 사용됩니다.</p>
      </div>
      <div className="agreement-list">
        <ToggleRow
          label="개인정보 수집 및 이용 동의"
          required
          checked={checked.privacy}
          onChange={() => setChecked((value) => ({ ...value, privacy: !value.privacy }))}
        />
        <ToggleRow
          label="생년월일 및 출생시간 기반 분석 동의"
          required
          checked={checked.profile}
          onChange={() => setChecked((value) => ({ ...value, profile: !value.profile }))}
        />
        <ToggleRow
          label="운세 알림 및 소식 수신"
          checked={checked.marketing}
          onChange={() => setChecked((value) => ({ ...value, marketing: !value.marketing }))}
        />
      </div>
      <button className="primary-button full" type="button" disabled={!requiredChecked} onClick={onAgree}>
        동의하고 계속
      </button>
    </section>
  );
}

function ProfileScreen({
  profile,
  isLoading,
  onChange,
  onSubmit,
}: {
  profile: UserProfile;
  isLoading: boolean;
  onChange: (profile: UserProfile) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="screen profile-screen">
      <header className="top-bar">
        <BrandMark />
      </header>
      <div className="copy-block compact">
        <p className="eyebrow">PROFILE</p>
        <h2>출생 정보를 입력해 주세요</h2>
      </div>
      <form className="profile-form" onSubmit={onSubmit}>
        <label>
          이름 또는 태그
          <input
            value={profile.name}
            onChange={(event) => onChange({ ...profile, name: event.target.value })}
            placeholder="예: 나, 엄마, 친구"
            required
          />
        </label>
        <label>
          생년월일
          <input
            type="date"
            value={profile.birthDate}
            onChange={(event) => onChange({ ...profile, birthDate: event.target.value })}
            required
          />
        </label>
        <label>
          태어난 시간
          <input
            type="time"
            value={profile.birthTime}
            onChange={(event) => onChange({ ...profile, birthTime: event.target.value })}
            required
          />
        </label>
        <SegmentedControl
          label="성별"
          value={profile.gender}
          options={[
            ["female", "여성"],
            ["male", "남성"],
            ["other", "선택 안 함"],
          ]}
          onChange={(gender) => onChange({ ...profile, gender: gender as Gender })}
        />
        <SegmentedControl
          label="달력"
          value={profile.calendarType}
          options={[
            ["solar", "양력"],
            ["lunar", "음력"],
          ]}
          onChange={(calendarType) => onChange({ ...profile, calendarType: calendarType as CalendarType })}
        />
        <button className="primary-button full" type="submit" disabled={isLoading}>
          {isLoading ? "운결 읽는 중" : "내 사주 보기"}
        </button>
      </form>
    </section>
  );
}

function HomeScreen({
  profile,
  summary,
  onEdit,
}: {
  profile: UserProfile;
  summary: SajuSummary | null;
  onEdit: () => void;
}) {
  if (!summary) {
    return (
      <section className="screen home-screen">
        <p>데이터를 준비하고 있어요.</p>
      </section>
    );
  }

  const maxElement = Math.max(...Object.values(summary.elements));

  return (
    <section className="screen home-screen">
      <header className="home-header">
        <div>
          <p className="eyebrow">TODAY</p>
          <h2>{profile.name}님의 운결</h2>
          <p>
            {profile.birthDate} {profile.birthTime} · {profile.calendarType === "solar" ? "양력" : "음력"}
          </p>
        </div>
        <button className="ghost-button" type="button" onClick={onEdit}>
          수정
        </button>
      </header>

      <section className="fortune-card">
        <p className="eyebrow">일진 {summary.today.iljin}</p>
        <h3>{summary.today.total}</h3>
        <div className="fortune-grid">
          <MiniFortune label="재물" value={summary.today.money} />
          <MiniFortune label="애정" value={summary.today.love} />
          <MiniFortune label="건강" value={summary.today.health} />
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h3>사주팔자</h3>
          <span>{summary.luckyColor}</span>
        </div>
        <div className="pillar-grid">
          {summary.pillars.map((pillar) => (
            <article className="pillar-card" key={pillar.label}>
              <span>{pillar.label}</span>
              <strong>{pillar.cheongan}{pillar.jiji}</strong>
              <em style={{ color: elementMeta[pillar.element].color }}>{elementMeta[pillar.element].name}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h3>오행 분포</h3>
          <span>목 화 토 금 수</span>
        </div>
        <div className="element-bars">
          {(Object.keys(summary.elements) as ElementKey[]).map((key) => (
            <div className="element-row" key={key}>
              <span>{elementMeta[key].name}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(summary.elements[key] / maxElement) * 100}%`,
                    backgroundColor: elementMeta[key].color,
                  }}
                />
              </div>
              <b>{summary.elements[key]}</b>
            </div>
          ))}
        </div>
        <p className="note">{summary.jeolgiNote}</p>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h3>대운 타임라인</h3>
          <span>현재 대운 표시</span>
        </div>
        <div className="timeline">
          {summary.daewoon.map((item) => (
            <article className={item.active ? "timeline-item active" : "timeline-item"} key={item.age}>
              <strong>{item.age}세</strong>
              <span>{item.label}</span>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <div className={large ? "brand-mark large" : "brand-mark"} aria-label="운결 로고">
      <div className="badge-points" />
      <div className="inner-pentagon" />
      <div className="moon" />
    </div>
  );
}

function ToggleRow({
  label,
  required = false,
  checked,
  onChange,
}: {
  label: string;
  required?: boolean;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="toggle-row">
      <span>
        {label}
        {required && <b>필수</b>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="segmented-field">
      <legend>{label}</legend>
      <div className="segmented-control">
        {options.map(([optionValue, optionLabel]) => (
          <button
            className={value === optionValue ? "selected" : ""}
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function MiniFortune({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <p>{value}</p>
    </article>
  );
}
