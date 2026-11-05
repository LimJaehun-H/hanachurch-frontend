import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import MinistryGraph from "../components/MinistryGraph.jsx";
import MinistryIcon from "../components/MinistryIcon.jsx";
import { CHURCH_ROOT, MINISTRY_INDEX, colorOf, hasPage } from "../data/ministries.js";
import { MINISTRY_PROFILES, PROFILE_ORDER } from "../data/ministryProfiles.js";
import "../ministry.css";

export default function Ministry() {
  const graphRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId && selectedId !== "root" ? MINISTRY_INDEX[selectedId] : null;

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="ministry_hero" fallbackImageUrl={null} />

      <main className="hc-ministry-page">
        <div className="hc-ministry-heading">
          <h1 className="hc-ministry-title">교회부서</h1>
          <div className="hc-location-divider">
            <span className="hc-location-divider-line" />
            <span className="hc-location-divider-label">Ministry</span>
            <span className="hc-location-divider-line" />
          </div>
          <p className="hc-ministry-lead">
            부서를 누르면 하위 부서가 펼쳐집니다. 끌어서 둘러보고, 두 손가락으로 확대해 보세요.
          </p>
        </div>

        <section className="hc-ministry-stage">
          <MinistryGraph ref={graphRef} selectedId={selectedId} onSelect={setSelectedId} />

          <div className="hc-ministry-tools" role="toolbar" aria-label="조직도 조작">
            <button type="button" onClick={() => graphRef.current?.zoomBy(1.3)} aria-label="확대">＋</button>
            <button type="button" onClick={() => graphRef.current?.zoomBy(1 / 1.3)} aria-label="축소">－</button>
            <button type="button" onClick={() => graphRef.current?.fitAll()}>전체</button>
          </div>
          <div className="hc-ministry-tools hc-ministry-tools--left">
            <button type="button" onClick={() => graphRef.current?.expandAll()}>모두 펼치기</button>
            <button type="button" onClick={() => { graphRef.current?.collapseAll(); setSelectedId(null); }}>접기</button>
          </div>
          <p className="hc-ministry-hint">PC에서는 Ctrl(⌘) + 휠로 확대·축소</p>

          {selected && (
            <div className="hc-ministry-card" style={{ "--mc": colorOf(selected.node.id) }}>
              <button type="button" className="hc-ministry-card-x" onClick={() => setSelectedId(null)} aria-label="닫기">
                ×
              </button>
              <p className="hc-ministry-card-path">
                {selected.path.slice(1, -1).map((p) => p.name).join(" › ") || "하나교회"}
              </p>
              <h2 className="hc-ministry-card-name">{selected.node.name}</h2>
              <p className="hc-ministry-card-desc">
                {MINISTRY_PROFILES[selected.node.id]?.tagline ||
                  selected.node.desc ||
                  ((selected.node.children || []).length
                    ? `하위 부서 ${selected.node.children.length}개: ${selected.node.children.map((c) => c.name).join(", ")}`
                    : "소개 글을 준비하고 있습니다.")}
              </p>
              {hasPage(selected.node.id) && (
                <Link to={`/ministry/${selected.node.id}`} className="hc-ministry-card-link">
                  부서 소개 보기 →
                </Link>
              )}
            </div>
          )}
        </section>

        {/* 사역박람회 자료가 있는 팀 소개 */}
        <section className="hc-ministry-profiles" aria-labelledby="hc-ministry-profiles-title">
          <p className="hc-ministry-profiles-eyebrow">함께 섬길 손길을 찾습니다</p>
          <h2 id="hc-ministry-profiles-title" className="hc-ministry-list-title">사역 소개</h2>
          <div className="hc-ministry-profile-grid">
            {PROFILE_ORDER.map((pid) => {
              const pr = MINISTRY_PROFILES[pid];
              const info = MINISTRY_INDEX[pid];
              return (
                <Link key={pid} to={`/ministry/${pid}`} className="hc-ministry-profile-card" style={{ "--mc": colorOf(pid) }}>
                  <MinistryIcon id={pid} name={pr.title} size={46} className="hc-ministry-profile-icon" />
                  <span className="hc-ministry-profile-dept">{info.path[1]?.name}</span>
                  <strong className="hc-ministry-profile-name">{pr.title}</strong>
                  <span className="hc-ministry-profile-tagline">{pr.tagline}</span>
                  <span className="hc-ministry-profile-more">자세히 보기 →</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 노드 화면을 쓰기 어려운 분과 검색엔진을 위한 목록 */}
        <section className="hc-ministry-list" aria-labelledby="hc-ministry-list-title">
          <h2 id="hc-ministry-list-title" className="hc-ministry-list-title">부서 한눈에 보기</h2>
          <div className="hc-ministry-list-grid">
            {CHURCH_ROOT.children.map((dept) => (
              <div key={dept.id} className="hc-ministry-list-dept" style={{ "--mc": colorOf(dept.id) }}>
                <Link to={`/ministry/${dept.id}`} className="hc-ministry-list-head">
                  {dept.name}
                </Link>
                <ul>
                  {(dept.children || []).map((sub) => (
                    <li key={sub.id}>
                      <Link to={`/ministry/${sub.id}`}>{sub.name}</Link>
                      {sub.children && (
                        <span className="hc-ministry-list-leaves">
                          {sub.children.map((leaf, i) => (
                            <React.Fragment key={leaf.id}>
                              {i > 0 && " · "}
                              {hasPage(leaf.id) ? (
                                <Link to={`/ministry/${leaf.id}`} className="hc-ministry-list-leaf-link">{leaf.name}</Link>
                              ) : (
                                leaf.name
                              )}
                            </React.Fragment>
                          ))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
