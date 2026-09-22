import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";

const CATEGORY_LABELS = {
  SUNDAY: "주일예배",
  DAWN: "새벽예배",
};

export default function AdminSermonPanel({ token, onAuthExpired }) {
  const [sermons, setSermons] = useState({ SUNDAY: null, DAWN: null });
  const [category, setCategory] = useState("SUNDAY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [status, setStatus] = useState(null);

  const load = (cat) => {
    fetch(`${API_BASE_URL}/api/sermons?category=${cat}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSermons((prev) => ({ ...prev, [cat]: data })))
      .catch(() => setSermons((prev) => ({ ...prev, [cat]: [] })));
  };

  useEffect(() => {
    load("SUNDAY");
    load("DAWN");
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      setStatus({ ok: false, msg: "녹음 파일을 선택해주세요." });
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("audioFile", audioFile);

    try {
      const res = await authFetch(token, "/api/sermons", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "등록에 실패했습니다.");
      }
      setStatus({ ok: true, msg: "등록되었습니다." });
      setTitle("");
      setContent("");
      setAudioFile(null);
      load(category);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: err.message });
    }
  };

  const handleDelete = async (id, cat) => {
    if (!window.confirm("이 말씀을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/sermons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load(cat);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">말씀 관리</h2>

      <form className="hc-admin-form" onSubmit={handleCreate}>
        <div className="hc-admin-category-select">
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <label key={value} className="hc-admin-category-option">
              <input
                type="radio"
                name="sermonCategory"
                value={value}
                checked={category === value}
                onChange={() => setCategory(value)}
              />
              {label}
            </label>
          ))}
        </div>

        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit" className="hc-admin-btn">등록</button>
      </form>

      {status && (
        <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
      )}

      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
        <div key={value} className="hc-admin-sermon-group">
          <p className="hc-admin-sermon-group-title">{label}</p>
          {sermons[value] === null && <p className="hc-loading">불러오는 중…</p>}
          {sermons[value] && sermons[value].length === 0 && (
            <p className="hc-empty">등록된 말씀이 없습니다.</p>
          )}
          {sermons[value] && sermons[value].length > 0 && (
            <ul className="hc-admin-list">
              {sermons[value].map((s) => (
                <li key={s.id} className="hc-admin-list-row">
                  <span>{s.title}</span>
                  <button
                    className="hc-admin-btn hc-admin-btn--danger"
                    onClick={() => handleDelete(s.id, value)}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}