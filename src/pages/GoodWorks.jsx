import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import MinistryGraph from "../components/MinistryGraph.jsx";
import MinistryOrgChart from "../components/MinistryOrgChart.jsx";
import { GOOD_WORKS_TREE } from "../data/goodWorks.js";
import "../ministry.css";

// 부서소개 · Good Works 시안 (사역박람회 팸플릿 기준 구성, dev 확인용 /good-works)
// 조직도 보기와 부서 맵 보기를 탭으로 전환
export default function GoodWorks() {
  const graphRef = useRef(null);
  const [view, setView] = useState("chart");
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const tree = GOOD_WORKS_TREE;

  // 부서 맵: 맨 끝 팀에 소개 페이지가 있으면 바로 이동
  const handleSelect = (id) => {
    const info = tree.index[id];
    const isLeaf = !(info?.node.children || []).length;
    if (isLeaf && tree.hasPage(id)) {
      navigate(`/ministry/${id}`);
      return;
    }
    setSelectedId(id);
  };

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="ministry_hero" fallbackImageUrl={null} />

      <main className="hc-ministry-page">
        <div className="hc-ministry-heading">
          <h1 className="hc-ministry-title">부서소개</h1>
          <div className="hc-location-divider">
            <span className="hc-location-divider-line" />
            <span className="hc-location-divider-label">Good Works</span>
            <span className="hc-location-divider-line" />
          </div>
          <p className="hc-ministry-lead">교회를 위해 섬기는 손길들을 소개합니다.</p>
        </div>

        <div className="gw-tabs" role="tablist" aria-label="보기 방식">
          <button type="button" role="tab" aria-selected={view === "chart"} onClick={() => setView("chart")}>
            조직도
          </button>
          <button type="button" role="tab" aria-selected={view === "map"} onClick={() => setView("map")}>
            부서 맵
          </button>
        </div>

        {view === "chart" ? (
          <MinistryOrgChart tree={tree} />
        ) : (
          <section className="hc-ministry-stage">
            <MinistryGraph ref={graphRef} tree={tree} selectedId={selectedId} onSelect={handleSelect} />
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
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
