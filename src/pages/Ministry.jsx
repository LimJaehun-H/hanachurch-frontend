import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import MinistryGraph from "../components/MinistryGraph.jsx";
import { useMinistryTree } from "../data/ministryApi.js";
import "../ministry.css";

// 교회부서 (부서 맵 + 부서 한눈에 보기)
// 데이터는 백엔드 /api/ministries/tree (못 불러오면 src/data/goodWorks.js)
export default function Ministry() {
  const tree = useMinistryTree(); // 불러오는 동안 null
  const graphRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

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

  const Name = ({ node, className }) =>
    tree.hasPage(node.id) ? (
      <Link to={`/ministry/${node.id}`} className={className}>
        {node.name}
      </Link>
    ) : (
      <span className={className}>{node.name}</span>
    );

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
            하나교회를 누르면 부서가, 부서를 누르면 하위 팀이 펼쳐집니다. 끌어서 둘러보고, 두 손가락으로 확대해 보세요.
          </p>
        </div>

        <section className="hc-ministry-stage">
          {tree ? (
            <MinistryGraph ref={graphRef} tree={tree} selectedId={selectedId} onSelect={handleSelect} />
          ) : (
            <p className="hc-ministry-loading">부서를 불러오는 중…</p>
          )}

          <div className="hc-ministry-tools" role="toolbar" aria-label="조직도 조작">
            <button type="button" onClick={() => graphRef.current?.zoomBy(1.3)} aria-label="확대">＋</button>
            <button type="button" onClick={() => graphRef.current?.zoomBy(1 / 1.3)} aria-label="축소">－</button>
            <button type="button" onClick={() => graphRef.current?.fitAll()}>전체</button>
          </div>
          <div className="hc-ministry-tools hc-ministry-tools--left">
            <button type="button" onClick={() => { graphRef.current?.collapseAll(); setSelectedId(null); }}>접기</button>
          </div>
          <p className="hc-ministry-hint">PC에서는 Ctrl(⌘) + 휠로 확대·축소</p>
        </section>

        {/* 노드 화면을 쓰기 어려운 분과 검색엔진을 위한 목록 */}
        {tree && (
        <section className="hc-ministry-list" aria-labelledby="hc-ministry-list-title">
          <h2 id="hc-ministry-list-title" className="hc-ministry-list-title">부서 한눈에 보기</h2>
          <div className="hc-ministry-list-grid">
            {tree.root.children.map((dept) => (
              <div key={dept.id} className="hc-ministry-list-dept" style={{ "--mc": tree.colorOf(dept.id) }}>
                <Name node={dept} className="hc-ministry-list-head" />
                {(dept.children || []).length > 0 && (
                  <ul>
                    {dept.children.map((sub) => (
                      <li key={sub.id}>
                        <Name node={sub} className="hc-ministry-list-name" />
                        {sub.children && (
                          <span className="hc-ministry-list-leaves">
                            {sub.children.map((leaf, i) => (
                              <React.Fragment key={leaf.id}>
                                {i > 0 && " · "}
                                <Name node={leaf} className="hc-ministry-list-leaf" />
                              </React.Fragment>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
