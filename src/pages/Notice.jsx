import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, NOTICE_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

const PAGE_SIZE = 10;

export default function Notice() {
  const [notices, setNotices] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/notices`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setNotices)
      .catch(() => setNotices([]));
  }, []);

  const totalPages = Math.max(1, Math.ceil((notices?.length || 0) / PAGE_SIZE));
  const pageItems = (notices || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="notice_hero" fallbackImageUrl={NOTICE_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <div className="hc-bulletin-heading-row">
          <h1 className="hc-bulletin-heading-title">교회소식</h1>
          <span className="hc-bulletin-heading-line" />
        </div>

        {notices === null && <p className="hc-loading">불러오는 중…</p>}
        {notices && notices.length === 0 && (
          <div className="hc-empty">아직 등록된 교회소식이 없습니다.</div>
        )}
        {notices && notices.length > 0 && (
          <>
            <ul className="hc-list">
              {pageItems.map((n) => (
                <li key={n.id} className="hc-list-item">
                  <Link to={`/notice/${n.id}`} className="hc-list-row">
                    <span className="hc-list-title">{n.title}</span>
                    {n.createdAt && <span className="hc-list-meta">{formatDate(n.createdAt)}</span>}
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="hc-album-pagination">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === page ? "hc-album-page--active" : ""}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}