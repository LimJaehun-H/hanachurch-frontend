import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, SUNDAY_WORSHIP_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

export default function SermonDetail() {
  const { id } = useParams();
  const [sermon, setSermon] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSermon(null);
    setError(false);
    fetch(`${API_BASE_URL}/api/sermons/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setSermon)
      .catch(() => setError(true));
  }, [id]);

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="sunday_worship_hero" fallbackImageUrl={SUNDAY_WORSHIP_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <Link to="/" className="hc-album-detail-back">← 홈으로</Link>

        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <div className="hc-bulletin-heading-row">
          <h1 className="hc-bulletin-heading-title">말씀</h1>
          <span className="hc-bulletin-heading-line" />
        </div>

        {error && <div className="hc-empty">말씀을 찾을 수 없습니다.</div>}
        {!error && sermon === null && <p className="hc-loading">불러오는 중…</p>}

        {sermon && (
          <>
            <h2 className="hc-bulletin-detail-title">{sermon.title}</h2>
            <p className="hc-bulletin-detail-date">{formatDate(sermon.createdAt)}</p>

            <p className="hc-notice-detail-content">{sermon.content}</p>

            <audio
              controls
              src={`${API_BASE_URL}/uploads/sermons/${sermon.audioUrl}`}
              className="hc-sermon-audio"
            />

            <a
              href={`${API_BASE_URL}/uploads/sermons/${sermon.audioUrl}`}
              download
              className="hc-sermon-download"
            >
              말씀 파일 다운로드 →
            </a>
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