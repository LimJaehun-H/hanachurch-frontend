import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, BULLETIN_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

export default function Bulletin() {
  const [bulletins, setBulletins] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bulletins`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setBulletins)
      .catch(() => setBulletins([]));
  }, []);

  const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const thumbUrlOf = (b) => {
    const firstFile = b.files?.[0]?.fileUrl;
    if (!firstFile) return null;
    const isImage = IMAGE_EXTENSIONS.some((ext) =>
      firstFile.toLowerCase().endsWith(ext)
    );
    return isImage ? `${API_BASE_URL}/uploads/${firstFile}` : null;
  };
  const isRecent = (dateStr) => {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && Date.now() - d.getTime() < 1000 * 60 * 60 * 24 * 7;
  };

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="bulletin_hero" fallbackImageUrl={BULLETIN_HERO_IMAGE_URL} />

      <main className="hc-bulletin-page">
        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <div className="hc-bulletin-heading-row">
          <h1 className="hc-bulletin-heading-title">교회주보</h1>
          <span className="hc-bulletin-heading-line" />
        </div>

        <section className="hc-bulletin-list-col">
          {bulletins === null && <p className="hc-loading">불러오는 중…</p>}
          {bulletins && bulletins.length === 0 && (
            <div className="hc-empty">아직 등록된 주보가 없습니다.</div>
          )}
          {bulletins && bulletins.length > 0 && (
            <ul className="hc-bulletin-list">
              {bulletins.map((b, index) => (
                <li key={b.id} className="hc-bulletin-item">
                  <Link to={`/bulletin/${b.id}`} className="hc-bulletin-row">
                    <span className="hc-bulletin-thumb">
                      {thumbUrlOf(b) ? (
                        <img src={thumbUrlOf(b)} alt="" />
                      ) : (
                        <DocumentIcon />
                      )}
                    </span>

                    <span className="hc-bulletin-info">
                      <span className="hc-bulletin-title-row">
                        <span className="hc-bulletin-title">{b.title}</span>
                        {index === 0 && <span className="hc-bulletin-badge">N</span>}
                      </span>
                      <span className="hc-bulletin-date">{formatDate(b.serviceDate)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 48 64" className="hc-bulletin-thumb-icon" aria-hidden="true">
      <rect x="2" y="2" width="44" height="60" rx="3" fill="#F1EFE9" stroke="#D8D4CB" />
      <line x1="10" y1="16" x2="38" y2="16" stroke="#B8B2A4" strokeWidth="2" />
      <line x1="10" y1="26" x2="38" y2="26" stroke="#B8B2A4" strokeWidth="2" />
      <line x1="10" y1="36" x2="30" y2="36" stroke="#B8B2A4" strokeWidth="2" />
    </svg>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}