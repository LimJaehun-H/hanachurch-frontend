import React from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import MinistryIcon from "../components/MinistryIcon.jsx";
import { MINISTRY_INDEX, colorOf, hasPage } from "../data/ministries.js";
import { MINISTRY_PROFILES } from "../data/ministryProfiles.js";
import { CHURCH_INFO } from "../config.js";
import "../ministry.css";

function CheckList({ items }) {
  return (
    <ul className="hc-mp-checks">
      {items.map((t) => (
        <li key={t}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MinistryDetail() {
  const { id } = useParams();
  const info = MINISTRY_INDEX[id];

  if (!info || !hasPage(id)) {
    return (
      <div className="hc-page">
        <Header variant="overlay" />
        <SubHero groupKey="ministry_hero" fallbackImageUrl={null} />
        <main className="hc-ministry-detail">
          <p className="hc-empty">찾는 부서가 없습니다.</p>
          <Link to="/ministry" className="hc-ministry-back">← 교회부서로 돌아가기</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { node, path } = info;
  const profile = MINISTRY_PROFILES[id];
  const title = profile?.title || node.name;
  const children = node.children || [];
  const color = colorOf(id);
  const quotes = [...(profile?.joy || []), ...(profile?.message || [])];

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="ministry_hero" fallbackImageUrl={null} />

      <main className="hc-ministry-detail" style={{ "--mc": color }}>
        <nav className="hc-ministry-crumb" aria-label="부서 위치">
          <Link to="/ministry">교회부서</Link>
          {path.slice(1, -1).map((p) => (
            <React.Fragment key={p.id}>
              <span aria-hidden="true">›</span>
              {hasPage(p.id) ? <Link to={`/ministry/${p.id}`}>{p.name}</Link> : <span>{p.name}</span>}
            </React.Fragment>
          ))}
        </nav>

        <header className="hc-mp-head">
          <MinistryIcon id={id} name={title} size={64} className="hc-mp-head-icon" />
          <div>
            <h1 className="hc-mp-title">{title}</h1>
            {profile?.tagline && <p className="hc-mp-tagline">{profile.tagline}</p>}
          </div>
        </header>

        {profile ? (
          <>
            <section className="hc-mp-section">
              <h2 className="hc-mp-h2">이 사역은 무엇을 하나요?</h2>
              <div className="hc-mp-about">
                {profile.about.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </section>

            {(profile.fit || profile.need) && (
              <div className="hc-mp-pair">
                {profile.fit && (
                  <section className="hc-mp-box">
                    <h2 className="hc-mp-h2">이런 분께 잘 맞아요</h2>
                    <CheckList items={profile.fit} />
                  </section>
                )}
                {profile.need && (
                  <section className="hc-mp-box hc-mp-box--need">
                    <h2 className="hc-mp-h2">지금 필요한 손길</h2>
                    <CheckList items={profile.need} />
                  </section>
                )}
              </div>
            )}

            {profile.method && (
              <section className="hc-mp-section">
                <h2 className="hc-mp-h2">사역 방식은 이렇습니다</h2>
                <ol className="hc-mp-steps">
                  {profile.method.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                {(profile.time || profile.place) && (
                  <p className="hc-mp-when">
                    {[profile.time, profile.place].filter(Boolean).join(" · ")}
                  </p>
                )}
              </section>
            )}

            {quotes.length > 0 && (
              <section className="hc-mp-quotes" aria-label="이 사역의 기쁨">
                <p className="hc-mp-quotes-label">이 사역의 기쁨</p>
                {quotes.map((q) => (
                  <blockquote key={q}>{q}</blockquote>
                ))}
              </section>
            )}

            <section className="hc-mp-join">
              <div>
                <h2 className="hc-mp-join-title">함께 섬기고 싶으신가요?</h2>
                <p className="hc-mp-join-text">
                  {profile.contact
                    ? `담당: ${profile.contact}`
                    : "담당자 안내를 준비하고 있습니다. 교회 사무실로 문의해 주세요."}
                </p>
              </div>
              <a href={`tel:${CHURCH_INFO.phone}`} className="hc-mp-join-btn">
                {CHURCH_INFO.phone} 전화하기
              </a>
            </section>
          </>
        ) : (
          <div className="hc-ministry-detail-body">
            {node.desc ? (
              <p>{node.desc}</p>
            ) : (
              <p className="hc-ministry-detail-pending">부서 소개 글과 사진을 준비하고 있습니다.</p>
            )}
          </div>
        )}

        {children.length > 0 && (
          <section className="hc-ministry-sub">
            <h2 className="hc-ministry-sub-title">하위 부서</h2>
            <ul className="hc-ministry-chips">
              {children.map((c) => (
                <li key={c.id}>
                  {hasPage(c.id) ? <Link to={`/ministry/${c.id}`}>{c.name}</Link> : <span>{c.name}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link to="/ministry" className="hc-ministry-back">← 조직도로 돌아가기</Link>
      </main>
      <Footer />
    </div>
  );
}
