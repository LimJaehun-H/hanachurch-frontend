import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";

export default function SermonList({ category }) {
  const [sermons, setSermons] = useState(null);

  useEffect(() => {
    setSermons(null);
    fetch(`${API_BASE_URL}/api/sermons?category=${category}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setSermons)
      .catch(() => setSermons([]));
  }, [category]);

  return (
    <>
      {sermons === null && <p className="hc-loading">불러오는 중…</p>}
      {sermons && sermons.length === 0 && (
        <div className="hc-empty">아직 등록된 말씀이 없습니다.</div>
      )}
      {sermons && sermons.length > 0 && (
        <ul className="hc-list">
          {sermons.map((s) => (
            <li key={s.id} className="hc-list-item">
              <Link to={`/sermon/${s.id}`} className="hc-list-row">
                <span className="hc-list-title">{s.title}</span>
                <span className="hc-list-meta">{formatDate(s.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}