import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../ministry-preview.css";

// 부서 소개 레이아웃 시안 A/B/C 비교용 (임시 페이지, /ministry-preview)
// 내용: 사역박람회 PDF 1쪽 "주방봉사팀" (이름·한 줄 소개·하는 일·사역 방식·기쁨만 사용)
// 사진은 아직 없어서 자리 표시로 채움

const DEPT = {
  slug: "kitchen-serve",
  name: "주방봉사팀",
  path: ["사회봉사부", "급식 및 주방 지원"],
  color: "#D98324",
  tagline: "주일과 절기행사를 사랑으로 준비하고 섬기다",
  about: [
    "주방봉사팀은 주일 점심식사와 절기행사 음식을 준비하고 제공합니다.",
    "음식 준비와 배식, 뒷정리를 통해 공동체가 편안히 예배와 모임에 참여하도록 돕습니다.",
    "보이지 않는 자리에서 사랑과 섬김으로 교회를 세우는 귀한 사역입니다.",
  ],
  method: [
    "주일 점심식사 준비 및 배식, 뒷정리",
    "절기 행사 음식 준비, 배식",
    "주방 위생 및 안전 관리",
    "사역 전후 기도와 팀원 간 협력 모임 참여",
  ],
  joy: [
    "내 손길로 준비한 음식이 성도들에게 사랑과 위로가 됩니다.",
    "작은 섬김이 공동체의 예배와 모임을 풍성하게 합니다.",
  ],
};

// 숟가락·포크 아이콘
function KitchenIcon({ size = 28 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10" />
    </svg>
  );
}

// 활동 사진 자리 (실제 사진이 들어갈 곳)
function Photo({ n, className = "" }) {
  return (
    <div className={`mlp-photo mlp-photo--${n} ${className}`} role="img" aria-label={`활동 사진 ${n} 자리`}>
      <KitchenIcon size={34} />
      <span>활동 사진 {n}</span>
    </div>
  );
}

/* ---------- A. 사진 크게 위에 ---------- */
function LayoutA({ d }) {
  return (
    <article className="mlp-a">
      <header className="mlp-a-hero">
        <Photo n={1} className="mlp-a-hero-photo" />
        <div className="mlp-a-hero-text">
          <p className="mlp-a-path">{d.path.join(" · ")}</p>
          <h1>{d.name}</h1>
          <p className="mlp-a-tagline">{d.tagline}</p>
        </div>
      </header>

      <div className="mlp-a-body">
        <section>
          <h2 className="mlp-a-h2">이 사역은 무엇을 하나요?</h2>
          {d.about.map((t) => (
            <p key={t} className="mlp-a-about">{t}</p>
          ))}
        </section>

        <section>
          <h2 className="mlp-a-h2">사역 방식은 이렇습니다</h2>
          <ol className="mlp-a-steps">
            {d.method.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <Photo n={2} className="mlp-a-photo2" />

        <section className="mlp-a-joy">
          <p className="mlp-a-joy-label">이 사역의 기쁨</p>
          {d.joy.map((t) => (
            <blockquote key={t}>{t}</blockquote>
          ))}
        </section>
      </div>
    </article>
  );
}

/* ---------- B. 잡지 스타일 ---------- */
function LayoutB({ d }) {
  return (
    <article className="mlp-b">
      <header className="mlp-b-head">
        <p className="mlp-b-eyebrow">
          <span>MINISTRY</span>
          {d.path.join(" / ")}
        </p>
        <h1>{d.name}</h1>
        <p className="mlp-b-tagline">{d.tagline}</p>
      </header>

      <section className="mlp-b-row">
        <Photo n={1} className="mlp-b-photo" />
        <div className="mlp-b-text">
          <p className="mlp-b-num">01</p>
          <h2>이 사역은 무엇을 하나요?</h2>
          <p className="mlp-b-lead">{d.about[0]}</p>
          {d.about.slice(1).map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </section>

      <section className="mlp-b-row mlp-b-row--rev">
        <Photo n={2} className="mlp-b-photo" />
        <div className="mlp-b-text">
          <p className="mlp-b-num">02</p>
          <h2>사역 방식은 이렇습니다</h2>
          <ul className="mlp-b-list">
            {d.method.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mlp-b-quote">
        <p className="mlp-b-num">03 · 이 사역의 기쁨</p>
        <blockquote>{d.joy[0]}</blockquote>
        {d.joy.slice(1).map((t) => (
          <p key={t} className="mlp-b-quote-sub">{t}</p>
        ))}
      </section>
    </article>
  );
}

/* ---------- C. 카드 스타일 ---------- */
function LayoutC({ d }) {
  return (
    <article className="mlp-c">
      <header className="mlp-c-head">
        <span className="mlp-c-icon">
          <KitchenIcon size={30} />
        </span>
        <div>
          <p className="mlp-c-path">{d.path.join(" › ")}</p>
          <h1>{d.name}</h1>
          <p className="mlp-c-tagline">{d.tagline}</p>
        </div>
      </header>

      <div className="mlp-c-photos">
        <Photo n={1} />
        <Photo n={2} />
      </div>

      <div className="mlp-c-grid">
        <section className="mlp-c-card mlp-c-card--wide">
          <h2>
            <span className="mlp-c-badge">하는 일</span>
          </h2>
          {d.about.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </section>

        <section className="mlp-c-card">
          <h2>
            <span className="mlp-c-badge">사역 방식</span>
          </h2>
          <ul className="mlp-c-checks">
            {d.method.map((t) => (
              <li key={t}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mlp-c-card mlp-c-card--joy">
          <h2>
            <span className="mlp-c-badge mlp-c-badge--light">이 사역의 기쁨</span>
          </h2>
          {d.joy.map((t) => (
            <blockquote key={t}>{t}</blockquote>
          ))}
        </section>
      </div>
    </article>
  );
}

const VARIANTS = [
  { key: "A", label: "A · 사진 크게", Comp: LayoutA },
  { key: "B", label: "B · 잡지", Comp: LayoutB },
  { key: "C", label: "C · 카드", Comp: LayoutC },
];

export default function MinistryLayoutPreview() {
  const [variant, setVariant] = useState("A");
  const { Comp } = VARIANTS.find((v) => v.key === variant);

  return (
    <div className="hc-page mlp" style={{ "--mc": DEPT.color }}>
      <Header variant="solid" />

      <div className="mlp-switch" role="tablist" aria-label="레이아웃 시안">
        <span className="mlp-switch-label">시안</span>
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={variant === v.key}
            className={variant === v.key ? "mlp-switch-on" : ""}
            onClick={() => {
              setVariant(v.key);
              window.scrollTo({ top: 0 });
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <main className="mlp-main">
        <Comp d={DEPT} />
        <Link to="/ministry" className="mlp-back">← 조직도로 돌아가기</Link>
      </main>
      <Footer />
    </div>
  );
}
