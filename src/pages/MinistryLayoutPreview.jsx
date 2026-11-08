import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../ministry-preview.css";

// 부서 소개 레이아웃 시안 A/B 비교용 (임시 페이지, /ministry-preview)
// 내용: 사역박람회 PDF 1쪽 "주방봉사팀" (이름·한 줄 소개·하는 일·사역 방식·기쁨만 사용)
// 사진은 아직 없어서 자리만 표시함

const DEPT = {
  name: "주방봉사팀",
  dept: "사회봉사부",
  group: "급식 및 주방 지원",
  color: "#C2662D",
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
  photos: [
    { caption: "주일 점심 배식" },
    { caption: "절기 행사 음식 준비" },
  ],
};

// 사진 자리 (실제 사진이 들어가면 <img>로 바뀜)
function Photo({ ratio = "4 / 3", label, className = "" }) {
  return (
    <div className={`mlp-ph ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={`${label} 사진 자리`}>
      <span>사진 · {label}</span>
    </div>
  );
}

/* ---------- A. 사진이 이끄는 다큐멘터리형 ---------- */
function LayoutA({ d }) {
  return (
    <article className="mla">
      <figure className="mla-hero">
        <Photo ratio="16 / 9" label={d.photos[0].caption} className="mla-hero-ph" />
        <figcaption>{d.photos[0].caption}</figcaption>
      </figure>

      <header className="mla-head">
        <p className="mla-kicker">
          {d.dept} <span aria-hidden="true">—</span> {d.group}
        </p>
        <h1>{d.name}</h1>
        <p className="mla-tagline">{d.tagline}</p>
      </header>

      <div className="mla-rows">
        <section className="mla-row">
          <h2>하는 일</h2>
          <div className="mla-about">
            {d.about.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </section>

        <section className="mla-row">
          <h2>사역 방식</h2>
          <ol className="mla-method">
            {d.method.map((t, i) => (
              <li key={t}>
                <span className="mla-num">{String(i + 1).padStart(2, "0")}</span>
                {t}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <figure className="mla-inset">
        <Photo ratio="3 / 2" label={d.photos[1].caption} />
        <figcaption>{d.photos[1].caption}</figcaption>
      </figure>

      <section className="mla-joy">
        <h2>이 사역의 기쁨</h2>
        <blockquote>{d.joy[0]}</blockquote>
        {d.joy.slice(1).map((t) => (
          <p key={t}>{t}</p>
        ))}
      </section>
    </article>
  );
}

/* ---------- B. 잡지 지면형 ---------- */
function LayoutB({ d }) {
  const [first, ...rest] = d.about;
  return (
    <article className="mlb">
      <header className="mlb-mast">
        <div className="mlb-mast-line">
          <span>하나교회 사역 소개</span>
          <span>{d.dept}</span>
        </div>
        <h1>{d.name}</h1>
        <p className="mlb-deck">{d.tagline}</p>
      </header>

      <div className="mlb-grid">
        <figure className="mlb-lead-photo">
          <Photo ratio="4 / 3" label={d.photos[0].caption} />
          <figcaption>
            <strong>{d.photos[0].caption}.</strong> {d.group}
          </figcaption>
        </figure>

        <div className="mlb-body">
          <p className="mlb-dropcap">{first}</p>
          {rest.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>

        <aside className="mlb-side">
          <h2>사역 방식</h2>
          <ul>
            {d.method.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </aside>

        <blockquote className="mlb-pull">
          <p>{d.joy[0]}</p>
        </blockquote>

        <figure className="mlb-small-photo">
          <Photo ratio="1 / 1" label={d.photos[1].caption} />
          <figcaption>{d.photos[1].caption}</figcaption>
        </figure>

        <div className="mlb-end">
          {d.joy.slice(1).map((t) => (
            <p key={t}>{t}</p>
          ))}
          <p className="mlb-sign">■</p>
        </div>
      </div>
    </article>
  );
}

const VARIANTS = [
  { key: "A", label: "A 사진 중심", Comp: LayoutA },
  { key: "B", label: "B 잡지 지면", Comp: LayoutB },
];

export default function MinistryLayoutPreview() {
  const [variant, setVariant] = useState("A");
  const { Comp } = VARIANTS.find((v) => v.key === variant);

  return (
    <div className="hc-page mlp" style={{ "--mc": DEPT.color }}>
      <Header variant="solid" />

      <nav className="mlp-switch" aria-label="레이아웃 시안">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            type="button"
            aria-pressed={variant === v.key}
            onClick={() => {
              setVariant(v.key);
              window.scrollTo({ top: 0 });
            }}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <main className="mlp-main">
        <Comp d={DEPT} />
        <Link to="/ministry" className="mlp-back">조직도로 돌아가기</Link>
      </main>
      <Footer />
    </div>
  );
}
