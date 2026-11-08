import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../ministry-preview.css";

// 부서 소개 페이지 예시 (디자인 A, 목사님 확인용 임시 페이지, /ministry-preview)
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
          <h2>이렇게 섬겨요</h2>
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
        <h2>섬김의 기쁨</h2>
        <blockquote>{d.joy[0]}</blockquote>
        {d.joy.slice(1).map((t) => (
          <p key={t}>{t}</p>
        ))}
      </section>
    </article>
  );
}

export default function MinistryLayoutPreview() {
  // 검색엔진에 안 잡히게 (목사님 확인용 예시 페이지)
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="hc-page mlp" style={{ "--mc": DEPT.color }}>
      <Header variant="solid" />
      <p className="mlp-note">부서 소개 페이지 예시 · 사진은 실제 활동 사진이 들어갈 자리입니다</p>
      <main className="mlp-main">
        <LayoutA d={DEPT} />
        <Link to="/ministry" className="mlp-back">조직도로 돌아가기</Link>
      </main>
      <Footer />
    </div>
  );
}
