import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, ALBUM_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setAlbum(null);
    setError(false);
    fetch(`${API_BASE_URL}/api/albums/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setAlbum)
      .catch(() => setError(true));
  }, [id]);

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="album_hero" fallbackImageUrl={ALBUM_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <Link to="/album" className="hc-album-detail-back">← 목록으로</Link>

        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <div className="hc-bulletin-heading-row">
          <h1 className="hc-bulletin-heading-title">교회앨범</h1>
          <span className="hc-bulletin-heading-line" />
        </div>

        {error && <div className="hc-empty">앨범을 찾을 수 없습니다.</div>}
        {!error && album === null && <p className="hc-loading">불러오는 중…</p>}

        {album && (
          <>
            <h2 className="hc-album-detail-title">{album.title}</h2>
            <p className="hc-album-detail-breadcrumb">{formatDate(album.createdAt)}</p>

            <div className="hc-album-detail-photos">
              {album.photos?.map((p) => (
                <img
                  key={p.id}
                  src={`${API_BASE_URL}/uploads/albums/${p.fileUrl}`}
                  alt={album.title}
                  className="hc-album-detail-photo"
                />
              ))}
            </div>
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