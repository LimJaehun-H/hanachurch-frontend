import React from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { MINISTRY_INDEX, colorOf, hasPage } from "../data/ministries.js";
import "../ministry.css";

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
  const children = node.children || [];

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="ministry_hero" fallbackImageUrl={null} />

      <main className="hc-ministry-detail" style={{ "--mc": colorOf(id) }}>
        <nav className="hc-ministry-crumb" aria-label="부서 위치">
          <Link to="/ministry">교회부서</Link>
          {path.slice(1, -1).map((p) => (
            <React.Fragment key={p.id}>
              <span aria-hidden="true">›</span>
              <Link to={`/ministry/${p.id}`}>{p.name}</Link>
            </React.Fragment>
          ))}
        </nav>

        <h1 className="hc-ministry-detail-title">{node.name}</h1>

        <div className="hc-ministry-detail-body">
          {node.desc ? (
            <p>{node.desc}</p>
          ) : (
            <p className="hc-ministry-detail-pending">부서 소개 글과 사진을 준비하고 있습니다.</p>
          )}
        </div>

        {node.photos?.length > 0 && (
          <div className="hc-ministry-photos">
            {node.photos.map((src) => (
              <img key={src} src={src} alt={`${node.name} 사진`} loading="lazy" />
            ))}
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
