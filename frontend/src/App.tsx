import { FormEvent, useEffect, useState } from "react";
import femaleIcon from "./assets/gender-female.svg";
import maleIcon from "./assets/gender-male.svg";
import loginGraphic from "./assets/login-graphic.svg";
import splashOneGraphic from "./assets/splash-1-graphic.svg";
import splashTwoGraphic from "./assets/splash-2-graphic.svg";
import splashThreeGraphic from "./assets/splash-3-graphic.svg";
import splashFourGraphic from "./assets/splash-4-graphic.svg";

const slides = [
  {
    graphic: splashOneGraphic,
    alt: "주황빛 사각형 안에서 빛나는 광석",
    title: ["태어난 순간에는 저마다", "다른 빛이 있습니다"],
    description: "천간의 기운이 당신의 가장 깊은 곳에 새겨집니다.",
  },
  {
    graphic: splashTwoGraphic,
    alt: "보랏빛 사각형 안에서 겹쳐지는 두 개의 고리",
    title: ["기운은 계절을 만나", "하나의 결이 됩니다"],
    description: "지지의 흐름 속에서 당신만의 무늬가 피어납니다.",
  },
  {
    graphic: splashThreeGraphic,
    alt: "민트빛 사각형 안에서 피어나는 빛의 꽃",
    title: ["어려운 사주를 나를", "닮은 장면으로"],
    description: "한자 없이 자연의 언어로 당신을 표현합니다.",
  },
  {
    graphic: splashFourGraphic,
    alt: "여러 빛이 어우러진 사각형 안의 빛결",
    title: ["당신만의 빛결을", "확인해보세요"],
    description: "하늘의 빛이 땅의 결을 만나, 당신만의 장면이 됩니다.",
  },
] as const;

type AppScreen =
  | "intro"
  | "onboarding"
  | "consent"
  | "login"
  | "name"
  | "birthDate"
  | "birthTime"
  | "gender"
  | "review"
  | "loading";
type SocialProvider = "kakao" | "google";
type AgreementKey = "terms" | "privacy" | "marketing";
type Agreements = Record<AgreementKey, boolean>;
type CalendarType = "solar" | "lunar";
type Gender = "female" | "male";

type ProfileData = {
  nickname: string;
  calendarType: CalendarType;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
  gender: Gender | "";
};

const initialProfile: ProfileData = {
  nickname: "",
  calendarType: "solar",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  birthTime: "",
  gender: "",
};

const birthTimeOptions = [
  ["unknown", "모름"],
  ["자시", "자시 (23:30~01:30)"],
  ["축시", "축시 (01:30~03:30)"],
  ["인시", "인시 (03:30~05:30)"],
  ["묘시", "묘시 (05:30~07:30)"],
  ["진시", "진시 (07:30~09:30)"],
  ["사시", "사시 (09:30~11:30)"],
  ["오시", "오시 (11:30~13:30)"],
  ["미시", "미시 (13:30~15:30)"],
  ["신시", "신시 (15:30~17:30)"],
  ["유시", "유시 (17:30~19:30)"],
  ["술시", "술시 (19:30~21:30)"],
  ["해시", "해시 (21:30~23:00)"],
] as const;

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getInitialScreen(): AppScreen {
  return window.location.pathname === "/auth/success" ? "name" : "intro";
}

function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="status-bar" aria-label={`현재 시각 ${time}`}>
      <time>{time}</time>
      <div className="device-status" aria-hidden="true">
        <span className="cellular-bars">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="battery-icon">
          <i />
        </span>
      </div>
    </div>
  );
}

function IntroScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2_000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <section className="intro-screen" aria-labelledby="intro-title">
      <div className="intro-visual" aria-hidden="true">
        <span className="intro-axis" />
        <span className="intro-orbit intro-orbit-one" />
        <span className="intro-orbit intro-orbit-two" />
        <span className="intro-core" />
      </div>
      <div className="intro-copy">
        <h1 id="intro-title">빛결</h1>
        <span aria-hidden="true" />
        <p>
          하늘의 빛이 땅의 결을 만나,
          <br />
          당신만의 장면이 됩니다.
        </p>
      </div>
    </section>
  );
}

function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  function moveNext() {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setActiveIndex((current) => current + 1);
  }

  return (
    <section className="splash-screen" aria-labelledby="splash-title">
      <StatusBar />
      <button className="skip-button" type="button" onClick={onComplete}>
        건너뛰기
      </button>

      <div className="splash-content" key={activeIndex}>
        <img className="splash-graphic" src={slide.graphic} alt={slide.alt} />
        <div className="splash-copy">
          <h1 id="splash-title">
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h1>
          <p>{slide.description}</p>
        </div>
      </div>

      <footer className="splash-footer">
        <div className="pagination" aria-label={`온보딩 4단계 중 ${activeIndex + 1}단계`}>
          {slides.map((item, index) => (
            <span className={index === activeIndex ? "active" : ""} key={item.description} />
          ))}
        </div>
        <button
          className={isLastSlide ? "next-button start-button" : "next-button"}
          type="button"
          onClick={moveNext}
        >
          <span>{isLastSlide ? "내 빛결 시작하기" : "다음"}</span>
          <span className="arrow" aria-hidden="true">→</span>
        </button>
      </footer>
    </section>
  );
}

function ConsentScreen({ onContinue }: { onContinue: () => void }) {
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const allChecked = Object.values(agreements).every(Boolean);
  const canContinue = agreements.terms && agreements.privacy;

  function toggleAll() {
    const nextValue = !allChecked;
    setAgreements({ terms: nextValue, privacy: nextValue, marketing: nextValue });
  }

  function toggleAgreement(key: AgreementKey) {
    setAgreements((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="consent-screen" aria-labelledby="consent-title">
      <StatusBar />
      <div className="consent-heading">
        <h1 id="consent-title">서비스 이용 동의</h1>
        <p>빛결을 시작하기 전에 아래 내용을 확인해주세요.</p>
      </div>

      <div className="agreement-list">
        <label className="agreement-row agreement-all">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          <span className="custom-check" aria-hidden="true" />
          <strong>전체 동의</strong>
        </label>
        <AgreementRow
          label="[필수] 서비스 이용약관 동의"
          checked={agreements.terms}
          onChange={() => toggleAgreement("terms")}
        />
        <AgreementRow
          label="[필수] 개인정보 처리방침 동의"
          checked={agreements.privacy}
          onChange={() => toggleAgreement("privacy")}
        />
        <AgreementRow
          label="[선택] 마케팅 정보 수신 동의"
          checked={agreements.marketing}
          onChange={() => toggleAgreement("marketing")}
        />
      </div>

      <button
        className="consent-button"
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
      >
        동의하고 계속하기
      </button>
    </section>
  );
}

function AgreementRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="agreement-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="custom-check" aria-hidden="true" />
      <span>{label}</span>
      <span className="agreement-chevron" aria-hidden="true">›</span>
    </label>
  );
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [loginError, setLoginError] = useState("");

  function startSocialLogin(provider: SocialProvider) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (import.meta.env.DEV && !apiBaseUrl) {
      onAuthenticated();
      return;
    }

    if (provider === "google") {
      setLoginError("구글 로그인은 서버 연결을 준비하고 있습니다.");
      return;
    }

    if (!apiBaseUrl) {
      setLoginError("로그인 서버 주소가 설정되지 않았습니다.");
      return;
    }

    window.location.assign(`${apiBaseUrl.replace(/\/$/, "")}/auth/${provider}/login`);
  }

  return (
    <section className="login-screen" aria-labelledby="login-title">
      <StatusBar />

      <div className="login-content">
        <img className="login-graphic" src={loginGraphic} alt="은은하게 빛나는 보석" />
        <div className="login-copy">
          <h1 id="login-title">
            태어난 날의 기운을
            <br />
            만나러 갈까요?
          </h1>
          <p>로그인하고 나만의 빛결을 확인해보세요</p>
        </div>
      </div>

      <div className="login-actions">
        <button
          className="social-button kakao-button"
          type="button"
          onClick={() => startSocialLogin("kakao")}
        >
          <span className="kakao-icon" aria-hidden="true" />
          카카오로 계속하기
        </button>
        <button
          className="social-button google-button"
          type="button"
          onClick={() => startSocialLogin("google")}
        >
          <span className="google-icon" aria-hidden="true">G</span>
          Google로 계속하기
        </button>
        <p className="login-terms">
          계속 진행 시 <a href="#terms">이용약관</a> 및{" "}
          <a href="#privacy">개인정보처리방침</a>에 동의합니다
        </p>
        {loginError && <p className="login-error" role="alert">{loginError}</p>}
      </div>
    </section>
  );
}

function NameScreen({
  nickname,
  onNicknameChange,
  onContinue,
}: {
  nickname: string;
  onNicknameChange: (value: string) => void;
  onContinue: () => void;
}) {
  const canContinue = nickname.trim().length > 0;

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    onNicknameChange(nickname.trim());
    onContinue();
  }

  return (
    <section className="name-screen" aria-labelledby="name-title">
      <StatusBar />

      <div className="setup-progress" aria-label="정보 입력 5단계 중 1단계">
        {Array.from({ length: 5 }, (_, index) => (
          <span className={index === 0 ? "active" : ""} key={index} />
        ))}
      </div>
      <p className="setup-count">1/5</p>

      <div className="name-heading">
        <h1 id="name-title">이름 또는 닉네임을 알려주세요</h1>
        <p>사주 결과에서 표시될 이름이에요</p>
      </div>

      <form className="name-form" onSubmit={submitName}>
        <label htmlFor="nickname">닉네임 입력</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          maxLength={20}
          autoComplete="nickname"
          onChange={(event) => onNicknameChange(event.target.value)}
        />
        <button type="submit" disabled={!canContinue}>
          <span>다음</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  );
}

function SetupHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <>
      <div className="setup-progress" aria-label={`정보 입력 5단계 중 ${step}단계`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span className={index < step ? "active" : ""} key={index} />
        ))}
      </div>
      <div className="setup-navigation">
        <button type="button" onClick={onBack} aria-label="이전 단계">‹</button>
        <span>{step}/5</span>
      </div>
    </>
  );
}

function BirthDateScreen({
  profile,
  onChange,
  onBack,
  onContinue,
}: {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const year = Number(profile.birthYear);
  const month = Number(profile.birthMonth);
  const day = Number(profile.birthDay);
  const currentYear = new Date().getFullYear();
  const date = new Date(year, month - 1, day);
  const isSolarDateValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date();
  const isLunarDateValid = month >= 1 && month <= 12 && day >= 1 && day <= 30;
  const canContinue =
    profile.birthYear.length === 4 &&
    year >= 1900 &&
    year <= currentYear &&
    (profile.calendarType === "solar" ? isSolarDateValid : isLunarDateValid);

  function updateNumber(field: "birthYear" | "birthMonth" | "birthDay", value: string, max: number) {
    onChange({ ...profile, [field]: value.replace(/\D/g, "").slice(0, max) });
  }

  return (
    <section className="setup-screen" aria-labelledby="birth-date-title">
      <StatusBar />
      <SetupHeader step={2} onBack={onBack} />
      <div className="setup-heading">
        <h1 id="birth-date-title">언제 태어나셨나요?</h1>
        <p>양력/음력을 선택하고 날짜를 입력해주세요</p>
      </div>

      <div className="calendar-toggle" role="group" aria-label="달력 종류">
        <button
          className={profile.calendarType === "solar" ? "active" : ""}
          type="button"
          onClick={() => onChange({ ...profile, calendarType: "solar" })}
        >
          양력
        </button>
        <button
          className={profile.calendarType === "lunar" ? "active" : ""}
          type="button"
          onClick={() => onChange({ ...profile, calendarType: "lunar" })}
        >
          음력
        </button>
      </div>

      <div className="date-fields">
        <label>
          <span>년도</span>
          <input
            inputMode="numeric"
            placeholder="1998"
            value={profile.birthYear}
            onChange={(event) => updateNumber("birthYear", event.target.value, 4)}
          />
        </label>
        <label>
          <span>월</span>
          <input
            inputMode="numeric"
            placeholder="03"
            value={profile.birthMonth}
            onChange={(event) => updateNumber("birthMonth", event.target.value, 2)}
          />
        </label>
        <label>
          <span>일</span>
          <input
            inputMode="numeric"
            placeholder="15"
            value={profile.birthDay}
            onChange={(event) => updateNumber("birthDay", event.target.value, 2)}
          />
        </label>
      </div>

      <SetupButton disabled={!canContinue} onClick={onContinue} />
    </section>
  );
}

function BirthTimeScreen({
  value,
  onChange,
  onBack,
  onContinue,
}: {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="setup-screen" aria-labelledby="birth-time-title">
      <StatusBar />
      <SetupHeader step={3} onBack={onBack} />
      <div className="setup-heading">
        <h1 id="birth-time-title">태어난 시간을 입력해주세요</h1>
        <p>모르시면 ‘모름’을 선택하셔도 괜찮아요</p>
      </div>
      <div className="time-options">
        {birthTimeOptions.map(([optionValue, label]) => (
          <button
            className={value === optionValue ? "active" : ""}
            type="button"
            key={optionValue}
            onClick={() => onChange(optionValue)}
          >
            {label}
          </button>
        ))}
      </div>
      <SetupButton disabled={!value} onClick={onContinue} />
    </section>
  );
}

function GenderScreen({
  value,
  onChange,
  onBack,
  onContinue,
}: {
  value: Gender | "";
  onChange: (value: Gender) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="setup-screen" aria-labelledby="gender-title">
      <StatusBar />
      <SetupHeader step={4} onBack={onBack} />
      <div className="setup-heading">
        <h1 id="gender-title">성별을 선택해주세요</h1>
        <p>오행 해석에 참고됩니다</p>
      </div>
      <div className="gender-options">
        <button
          className={value === "female" ? "active female" : ""}
          type="button"
          onClick={() => onChange("female")}
        >
          <img src={femaleIcon} alt="" />
          <span>여성</span>
        </button>
        <button
          className={value === "male" ? "active male" : ""}
          type="button"
          onClick={() => onChange("male")}
        >
          <img src={maleIcon} alt="" />
          <span>남성</span>
        </button>
      </div>
      <SetupButton disabled={!value} onClick={onContinue} />
    </section>
  );
}

function ReviewScreen({
  profile,
  onBack,
  onCalculate,
}: {
  profile: ProfileData;
  onBack: () => void;
  onCalculate: () => void;
}) {
  const paddedMonth = profile.birthMonth.padStart(2, "0");
  const paddedDay = profile.birthDay.padStart(2, "0");
  const timeLabel =
    birthTimeOptions.find(([value]) => value === profile.birthTime)?.[1] ?? profile.birthTime;

  return (
    <section className="setup-screen review-screen" aria-labelledby="review-title">
      <StatusBar />
      <SetupHeader step={5} onBack={onBack} />
      <div className="setup-heading">
        <h1 id="review-title">입력하신 정보를 확인해주세요</h1>
        <p>잘못된 정보는 수정 후 시작하세요</p>
      </div>

      <div className="profile-summary-card">
        <div>
          <span>이름</span>
          <strong>{profile.nickname}</strong>
        </div>
        <img src={loginGraphic} alt="" />
      </div>
      <div className="review-rows">
        <div>
          <span>생년월일</span>
          <strong>
            {profile.birthYear}.{paddedMonth}.{paddedDay} ({profile.calendarType === "solar" ? "양력" : "음력"})
          </strong>
        </div>
        <div>
          <span>태어난 시간</span>
          <strong>{timeLabel}</strong>
        </div>
        <div>
          <span>성별</span>
          <strong>{profile.gender === "female" ? "여성" : "남성"}</strong>
        </div>
      </div>
      <p className="review-note">정보는 언제든 마이페이지에서 수정할 수 있어요</p>

      <button className="calculate-button" type="button" onClick={onCalculate}>
        <span>빛결 계산하기</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

function LoadingScreen() {
  return (
    <section className="loading-screen" aria-live="polite">
      <img src={loginGraphic} alt="" />
      <p>당신의 빛과 계절을 연결하고 있어요</p>
      <span>···</span>
    </section>
  );
}

function SetupButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button className="setup-button" type="button" disabled={disabled} onClick={onClick}>
      <span>다음</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  useEffect(() => {
    if (window.location.pathname !== "/auth/success") return;
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if (accessToken) sessionStorage.setItem("access_token", accessToken);
    window.history.replaceState({}, "", "/");
  }, []);

  return (
    <main className="app-shell">
      {screen === "intro" && <IntroScreen onComplete={() => setScreen("onboarding")} />}
      {screen === "onboarding" && (
        <OnboardingScreen onComplete={() => setScreen("consent")} />
      )}
      {screen === "consent" && <ConsentScreen onContinue={() => setScreen("login")} />}
      {screen === "login" && <LoginScreen onAuthenticated={() => setScreen("name")} />}
      {screen === "name" && (
        <NameScreen
          nickname={profile.nickname}
          onNicknameChange={(nickname) => setProfile((current) => ({ ...current, nickname }))}
          onContinue={() => setScreen("birthDate")}
        />
      )}
      {screen === "birthDate" && (
        <BirthDateScreen
          profile={profile}
          onChange={setProfile}
          onBack={() => setScreen("name")}
          onContinue={() => setScreen("birthTime")}
        />
      )}
      {screen === "birthTime" && (
        <BirthTimeScreen
          value={profile.birthTime}
          onChange={(birthTime) => setProfile((current) => ({ ...current, birthTime }))}
          onBack={() => setScreen("birthDate")}
          onContinue={() => setScreen("gender")}
        />
      )}
      {screen === "gender" && (
        <GenderScreen
          value={profile.gender}
          onChange={(gender) => setProfile((current) => ({ ...current, gender }))}
          onBack={() => setScreen("birthTime")}
          onContinue={() => setScreen("review")}
        />
      )}
      {screen === "review" && (
        <ReviewScreen
          profile={profile}
          onBack={() => setScreen("gender")}
          onCalculate={() => setScreen("loading")}
        />
      )}
      {screen === "loading" && <LoadingScreen />}
    </main>
  );
}
