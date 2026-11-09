import React from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";
import { ROOT_COLOR } from "../data/ministries.js";
import { useMinistry, useMinistryTree } from "../data/ministryApi.js";
import "../ministry-preview.css";

// 교회부서 소개 페이지 (/ministry/:id, 디자인 A)
// 내용은 백엔드 /api/ministries/{slug}, 하위 팀 목록과 색은 부서 나무에서 가져옴
export default function MinistryDetail() {
  const { id } = useParams();
  const { status, data } = useMinistry(id);
  const tree = useMinistryTree();

  const color = tree ? tree.colorOf(id) : ROOT_COLOR;
  const children = tree?.index[id]?.node.children || [];

  return (
    <div className="hc-page mlp" style={{ "--mc": color }}>
      <Header variant="solid" />
      <main className="mlp-main mlp-main--page">
        {status === "loading" && <p className="mla-state">불러오는 중…</p>}
        {status === "notfound" && <p className="mla-state">찾는 부서가 없습니다.</p>}
        {status === "error" && <p className="mla-state">부서 소개를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
        {status === "ok" && <Intro d={data} subs={children} hasPage={tree?.hasPage} />}
        <Link to="/ministry" className="mlp-back">교회부서로 돌아가기</Link>
      </main>
      <Footer />
    </div>
  );
}

function photoSrc(url) {
  return /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`;
}

function Photo({ photo, className = "" }) {
  return (
    <figure className={className}>
      <img className="mla-img" src={photoSrc(photo.url)} alt={photo.caption || ""} loading="lazy" />
      {photo.caption && <figcaption>{photo.caption}</figcaption>}
    </figure>
  );
}

function Intro({ d, subs, hasPage }) {
  const [hero, inset] = d.photos;
  const [firstJoy, ...restJoy] = d.joy;

  return (
    <article className="mla">
      {hero && <Photo photo={hero} className="mla-hero" />}

      <header className="mla-head">
        <p className="mla-kicker">{d.path.length ? d.path.join(" · ") : "하나교회"}</p>
        <h1>{d.name}</h1>
        {d.tagline && <p className="mla-tagline">{d.tagline}</p>}
      </header>

      <div className="mla-rows">
        {d.about.length > 0 && (
          <section className="mla-row">
            <h2>하는 일</h2>
            <div className="mla-about">
              {d.about.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>
        )}

        {d.method.length > 0 && (
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
        )}

        {subs.length > 0 && (
          <section className="mla-row">
            <h2>함께 섬기는 팀</h2>
            <ul className="mla-subs">
              {subs.map((s) => (
                <li key={s.id}>
                  {hasPage?.(s.id) ? <Link to={`/ministry/${s.id}`}>{s.name}</Link> : <span>{s.name}</span>}
                  {s.children?.length > 0 && (
                    <span className="mla-subs-leaves">{s.children.map((c) => c.name).join(" · ")}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {inset && <Photo photo={inset} className="mla-inset" />}

      {firstJoy && (
        <section className="mla-joy">
          <h2>섬김의 기쁨</h2>
          <blockquote>{firstJoy}</blockquote>
          {restJoy.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </section>
      )}
    </article>
  );
}
