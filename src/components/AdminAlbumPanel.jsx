import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";

export default function AdminAlbumPanel({ token, onAuthExpired }) {
  const [albums, setAlbums] = useState(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState(null);
  const filesRef = useRef(null);

  const load = () => {
    fetch(`${API_BASE_URL}/api/albums`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setAlbums)
      .catch(() => setAlbums([]));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const files = filesRef.current?.files;
    if (!files || files.length === 0 || !title.trim()) {
      setStatus({ ok: false, msg: "제목과 사진(1장 이상)을 모두 입력해주세요." });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      const res = await authFetch(token, "/api/albums", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "등록에 실패했습니다.");
      }
      setStatus({ ok: true, msg: "등록되었습니다." });
      setTitle("");
      if (filesRef.current) filesRef.current.value = "";
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "등록에 실패했습니다." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 앨범을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/albums/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">앨범 관리</h2>

      <form className="hc-admin-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="앨범 제목 (예: 2026 여름수련회)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="file" ref={filesRef} accept="image/*" multiple />
        <button type="submit" className="hc-admin-btn">업로드</button>
      </form>

      {status && (
        <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
      )}

      {albums === null && <p className="hc-loading">불러오는 중…</p>}
      {albums && albums.length === 0 && <p className="hc-empty">등록된 앨범이 없습니다.</p>}
      {albums && albums.length > 0 && (
        <ul className="hc-admin-list">
          {albums.map((a) => (
            <li key={a.id} className="hc-admin-list-row">
              <span>
                {a.title} · 사진 {a.photos?.length ?? 0}장
              </span>
              <button className="hc-admin-btn hc-admin-btn--danger" onClick={() => handleDelete(a.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}