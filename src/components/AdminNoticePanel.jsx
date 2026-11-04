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
  const [editingId, setEditingId] = useState(null); // 수정 중인 공지 id (없으면 새 글 등록)
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`${API_BASE_URL}/api/notices`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setNotices)
      .catch(() => setNotices([]));
  };

  useEffect(load, []);

  // 입력란 비우기 (편집기는 resetKey가 바뀌어야 내용이 다시 그려짐)
  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setResetKey((k) => k + 1);
  };

  const startEdit = (n) => {
    setTitle(n.title || "");
    setContent(n.content || "");
    setEditingId(n.id);
    setResetKey((k) => k + 1);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(token, editingId ? `/api/notices/${editingId}` : "/api/notices", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || (editingId ? "수정에 실패했습니다." : "등록에 실패했습니다."));
      }
      setStatus({ ok: true, msg: editingId ? "수정되었습니다." : "등록되었습니다." });
      resetForm();
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setStatus(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 공지사항을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">
        {editingId ? "교회소식 수정" : "교회소식 관리"}
      </h2>

      <form className="hc-admin-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <RichContentEditor value={content} onChange={setContent} token={token} resetKey={resetKey} />
        <div className="hc-admin-row-actions">
          <button type="submit" className="hc-admin-btn" disabled={saving}>
            {saving ? "저장 중..." : editingId ? "수정 저장" : "등록"}
          </button>
          {editingId && (
            <button type="button" className="hc-admin-btn hc-admin-btn--ghost" onClick={handleCancel}>
              취소
            </button>
          )}
        </div>
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
              <span>
                {editingId === n.id && <strong className="hc-admin-editing-mark">수정 중 · </strong>}
                {n.title}
              </span>
              <div className="hc-admin-row-actions">
                <button type="button" className="hc-admin-btn hc-admin-btn--ghost" onClick={() => startEdit(n)}>
                  수정
                </button>
                <button type="button" className="hc-admin-btn hc-admin-btn--danger" onClick={() => handleDelete(n.id)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
