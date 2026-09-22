import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";
import RichContentEditor from "./RichContentEditor.jsx";

export default function AdminNoticePanel({ token, onAuthExpired }) {
  const [notices, setNotices] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const load = () => {
    fetch(`${API_BASE_URL}/api/notices`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setNotices)
      .catch(() => setNotices([]));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(token, "/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "등록에 실패했습니다.");
      }
      setStatus({ ok: true, msg: "등록되었습니다." });
      setTitle("");
      setContent("");
      setResetKey((k) => k + 1);
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 공지사항을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">교회소식 관리</h2>

      <form className="hc-admin-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <RichContentEditor value={content} onChange={setContent} token={token} resetKey={resetKey} />
        <button type="submit" className="hc-admin-btn">등록</button>
      </form>

      {status && (
        <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
      )}

      {notices === null && <p className="hc-loading">불러오는 중…</p>}
      {notices && notices.length === 0 && <p className="hc-empty">등록된 공지사항이 없습니다.</p>}
      {notices && notices.length > 0 && (
        <ul className="hc-admin-list">
          {notices.map((n) => (
            <li key={n.id} className="hc-admin-list-row">
              <span>{n.title}</span>
              <button className="hc-admin-btn hc-admin-btn--danger" onClick={() => handleDelete(n.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}