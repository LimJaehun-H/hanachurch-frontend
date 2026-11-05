import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import MinistryGraph from "../components/MinistryGraph.jsx";
import { CHURCH_ROOT, MINISTRY_INDEX, colorOf, hasPage } from "../data/ministries.js";
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
                {selected.node.desc ||
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
                          {sub.children.map((leaf) => leaf.name).join(" · ")}
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
