import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";
import { compressImages } from "../utils/imageCompress.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus, AdminList, AdminRow, formatDate } from "./AdminUI.jsx";

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

    setStatus({ ok: true, msg: "사진 용량을 줄이는 중..." });
    const formData = new FormData();
    formData.append("title", title);
    (await compressImages(files)).forEach((file) => formData.append("files", file));

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
    <>
      <AdminSection title="새 앨범 올리기">
        <form onSubmit={handleCreate}>
          <AdminFieldTable>
            <AdminField label="앨범 제목" required>
              <input
                className="hc-adm-input"
                type="text"
                placeholder="예: 2026 여름수련회"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </AdminField>
            <AdminField label="사진" required hint="여러 장을 한 번에 고를 수 있습니다. 용량은 자동으로 줄여서 올립니다.">
              <input className="hc-adm-file" type="file" ref={filesRef} accept="image/*" multiple />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary">업로드</button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>

      <AdminSection title="등록된 앨범" count={albums?.length}>
        <AdminList loading={albums === null} empty={albums?.length === 0} emptyText="등록된 앨범이 없습니다.">
          {albums?.map((a) => (
            <AdminRow
              key={a.id}
              title={a.title}
              meta={`${formatDate(a.createdAt) ?? ""} · 사진 ${a.photos?.length ?? 0}장`}
              actions={
                <button type="button" className="hc-adm-btn hc-adm-btn--sm hc-adm-btn--danger" onClick={() => handleDelete(a.id)}>
                  삭제
                </button>
              }
            />
          ))}
        </AdminList>
      </AdminSection>
    </>
  );
}
