import React, { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import MinistryGraph from "../components/MinistryGraph.jsx";
import MinistryOrgChart from "../components/MinistryOrgChart.jsx";
import { useMinistryTree } from "../data/ministryApi.js";
import "../ministry.css";

// 교회부서: Good Works(조직도, 기본) / 부서 맵 탭
// 데이터는 백엔드 /api/ministries/tree (못 불러오면 src/data/goodWorks.js)
export default function Ministry() {
  const tree = useMinistryTree(); // 불러오는 동안 null
  const graphRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  // 보던 탭을 주소에 남겨서, 팀 소개에 갔다가 뒤로 와도 그대로 (?view=map)
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "map" ? "map" : "chart";
  const setView = (v) => {
    setSelectedId(null);
    setParams(v === "map" ? { view: "map" } : {}, { replace: true });
  };

  // 맨 끝 팀(하위 없음)에 소개 페이지가 있으면 바로 이동
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
          <h1 className="hc-ministry-title">교회부서</h1>
          <div className="hc-location-divider">
            <span className="hc-location-divider-line" />
            <span className="hc-location-divider-label">Ministry</span>
            <span className="hc-location-divider-line" />
          </div>
          <p className="hc-ministry-lead">
            {view === "chart"
              ? "교회를 위해 섬기는 부서와 팀입니다. 이름을 누르면 소개를 볼 수 있습니다."
              : "하나교회를 누르면 부서가, 부서를 누르면 하위 팀이 펼쳐집니다. 끌어서 둘러보고, 두 손가락으로 확대해 보세요."}
          </p>
        </div>

        <div className="gw-tabs" role="tablist" aria-label="보기 방식">
          <button type="button" role="tab" aria-selected={view === "chart"} onClick={() => setView("chart")}>
            Good Works
          </button>
          <button type="button" role="tab" aria-selected={view === "map"} onClick={() => setView("map")}>
            부서 맵
          </button>
        </div>

        {view === "chart" ? (
          tree ? <MinistryOrgChart tree={tree} /> : <p className="hc-ministry-loading">부서를 불러오는 중…</p>
        ) : (
        <>
        <section className="hc-ministry-stage">
          {tree ? (
            <MinistryGraph ref={graphRef} tree={tree} selectedId={selectedId} onSelect={handleSelect} />
          ) : (
            <p className="hc-ministry-loading">부서를 불러오는 중…</p>
          )}

          <div className="hc-ministry-tools" role="toolbar" aria-label="부서 맵 조작">
            <button type="button" onClick={() => graphRef.current?.zoomBy(1.3)} aria-label="확대">＋</button>
            <button type="button" onClick={() => graphRef.current?.zoomBy(1 / 1.3)} aria-label="축소">－</button>
            <button type="button" onClick={() => graphRef.current?.fitAll()}>전체</button>
          </div>
          <div className="hc-ministry-tools hc-ministry-tools--left">
            <button type="button" onClick={() => { graphRef.current?.collapseAll(); setSelectedId(null); }}>접기</button>
          </div>
          <p className="hc-ministry-hint">PC에서는 Ctrl(⌘) + 휠로 확대·축소</p>
        </section>

        </>
        )}
      </main>
      <Footer />
    </div>
  );
}
