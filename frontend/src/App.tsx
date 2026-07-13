import { useEffect, useState } from "react";
import splashOneGraphic from "./assets/splash-1-graphic.svg";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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

export default function App() {
  return (
    <main className="app-shell">
      <section className="splash-screen" aria-labelledby="splash-title">
        <StatusBar />

        <button className="skip-button" type="button">
          건너뛰기
        </button>

        <div className="splash-content">
          <img
            className="splash-graphic"
            src={splashOneGraphic}
            alt="주황빛 사각형 안에서 빛나는 광석"
          />

          <div className="splash-copy">
            <h1 id="splash-title">
              태어난 순간에는 저마다
              <br />
              다른 빛이 있습니다
            </h1>
            <p>천간의 기운이 당신의 가장 깊은 곳에 새겨집니다.</p>
          </div>
        </div>

        <footer className="splash-footer">
          <div className="pagination" aria-label="온보딩 4단계 중 1단계">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>
          <button className="next-button" type="button">
            <span>다음</span>
            <span className="arrow" aria-hidden="true">→</span>
          </button>
        </footer>
      </section>
    </main>
  );
}
