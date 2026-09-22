import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, BULLETIN_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

export default function BulletinDetail() {
  const { id } = useParams();
  const [bulletin, setBulletin] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setBulletin(null);
    setError(false);
    fetch(`${API_BASE_URL}/api/bulletins/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setBulletin)
      .catch(() => setError(true));
  }, [id]);

  const fileUrlOf = (fileUrl) => `${API_BASE_URL}/uploads/${encodeURIComponent(fileUrl)}`;
  const isPdf = (fileUrl) => (fileUrl || "").toLowerCase().endsWith(".pdf");

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="bulletin_hero" fallbackImageUrl={BULLETIN_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <Link to="/bulletin" className="hc-album-detail-back">← 목록으로</Link>

        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <div className="hc-bulletin-heading-row">
          <h1 className="hc-bulletin-heading-title">교회주보</h1>
          <span className="hc-bulletin-heading-line" />
        </div>

        {error && <div className="hc-empty">주보를 찾을 수 없습니다.</div>}
        {!error && bulletin === null && <p className="hc-loading">불러오는 중…</p>}

        {bulletin && (
          <>
            <h2 className="hc-bulletin-detail-title">{bulletin.title}</h2>
            <p className="hc-bulletin-detail-date">{formatDate(bulletin.serviceDate)}</p>

            {(bulletin.files || []).map((f, index) => (
              <div key={f.id} className="hc-bulletin-detail-file">
                {isPdf(f.fileUrl) ? (
                  <iframe
                    src={fileUrlOf(f.fileUrl)}
                    title={`${bulletin.title} ${index + 1}`}
                    className="hc-bulletin-detail-frame"
                  />
                ) : (
                  <img
                    src={fileUrlOf(f.fileUrl)}
                    alt={`${bulletin.title} ${index + 1}`}
                    className="hc-bulletin-detail-image"
                  />
                )}
              </div>
            ))}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}