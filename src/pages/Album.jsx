import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, ALBUM_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

const PAGE_SIZE = 20;

export default function Album() {
  const [albums, setAlbums] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/albums`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setAlbums)
      .catch(() => setAlbums([]));
  }, []);

  const filtered = useMemo(() => {
    if (!albums) return [];
    const q = query.trim().toLowerCase();
    if (!q) return albums;
    return albums.filter((a) => a.title.toLowerCase().includes(q));
  }, [albums, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const thumbUrlOf = (album) => {
    const first = album.photos?.[0];
    return first ? `${API_BASE_URL}/uploads/albums/${first.fileUrl}` : null;
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="album_hero" fallbackImageUrl={ALBUM_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <h1 className="hc-bulletin-heading-title">교회앨범</h1>

        {albums === null && <p className="hc-loading">불러오는 중…</p>}
        {albums && albums.length === 0 && (
          <div className="hc-empty">아직 등록된 앨범이 없습니다.</div>
        )}

        {albums && albums.length > 0 && (
          <>
            <div className="hc-album-grid">
              {pageItems.map((a) => (
                <Link key={a.id} to={`/album/${a.id}`} className="hc-album-card">
                  <div className="hc-album-thumb">
                    {thumbUrlOf(a) ? (
                      <img src={thumbUrlOf(a)} alt={a.title} />
                    ) : (
                      <div className="hc-album-thumb-empty" />
                    )}
                  </div>
                  <p className="hc-album-card-title">{a.title}</p>
                  <p className="hc-album-card-meta">{formatDate(a.createdAt)}</p>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="hc-empty">검색 결과가 없습니다.</div>
            )}

            <div className="hc-album-search-wrap">
              <input
                type="text"
                className="hc-album-search"
                placeholder="앨범 제목 검색"
                value={query}
                onChange={handleSearch}
              />
            </div>

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
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}