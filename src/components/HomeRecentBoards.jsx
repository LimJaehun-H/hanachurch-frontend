import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

export default function HomeRecentBoards() {
  const [bulletins, setBulletins] = useState(null);
  const [sermons, setSermons] = useState(null);
  const [ref, visible] = useScrollReveal(0.2, true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bulletins`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setBulletins(data.slice(0, 4)))
      .catch(() => setBulletins([]));

    fetch(`${API_BASE_URL}/api/sermons?category=SUNDAY`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSermons(data.slice(0, 5)))
      .catch(() => setSermons([]));
  }, []);

  return (
    <section className="hc-recent-boards" ref={ref}>
      <div
        className={`hc-recent-boards-grid ${visible ? "hc-reveal-visible" : "hc-reveal"}`}
      >
        <div className="hc-recent-col">
          <h3 className="hc-recent-col-title">교회주보</h3>

          {bulletins === null && <p className="hc-loading">불러오는 중…</p>}
          {bulletins && bulletins.length === 0 && (
            <p className="hc-empty">등록된 주보가 없습니다.</p>
          )}
          {bulletins && bulletins.length > 0 && (
            <ul className="hc-recent-list">
              {bulletins.map((b, i) => (
                <li
                  key={b.id}
                  className="hc-recent-list-item"
                  style={{ transitionDelay: visible ? `${i * 60}ms` : "0ms" }}
                >
                  <Link to={`/bulletin/${b.id}`} className="hc-recent-list-row">
                    <span className="hc-recent-list-title">{b.title}</span>
                    <span className="hc-recent-list-date">{formatDate(b.serviceDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hc-recent-col">
          <h3 className="hc-recent-col-title">주일예배</h3>

          {sermons === null && <p className="hc-loading">불러오는 중…</p>}
          {sermons && sermons.length === 0 && (
            <p className="hc-empty">준비중입니다. 곧 만나요!</p>
          )}
          {sermons && sermons.length > 0 && (
            <ul className="hc-recent-list">
              {sermons.map((s, i) => (
                <li
                  key={s.id}
                  className="hc-recent-list-item"
                  style={{ transitionDelay: visible ? `${i * 60}ms` : "0ms" }}
                >
                  <Link to={`/sermon/${s.id}`} className="hc-recent-list-row">
                    <span className="hc-recent-list-title">{s.title}</span>
                    <span className="hc-recent-list-date">{formatDate(s.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}