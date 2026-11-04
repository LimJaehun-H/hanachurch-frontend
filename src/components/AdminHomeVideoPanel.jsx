import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus } from "./AdminUI.jsx";

export default function AdminHomeVideoPanel({ token, onAuthExpired }) {
  const [video, setVideo] = useState(undefined); // undefined: 불러오는 중, null: 없음
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    fetch(`${API_BASE_URL}/api/home-video`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setVideo(data || null))
      .catch(() => setVideo(null));
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus({ ok: false, msg: "영상 파일을 선택해주세요." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await authFetch(token, "/api/home-video", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      setStatus({ ok: true, msg: "홈화면 영상이 교체되었습니다." });
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "업로드에 실패했습니다. (용량이 너무 크지 않은지 확인해주세요)" });
    }
  };

  const handleReset = async () => {
    if (!window.confirm("현재 홈영상을 삭제하고 기본 이미지로 되돌릴까요?")) return;
    try {
      const res = await authFetch(token, "/api/home-video", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setStatus({ ok: true, msg: "홈영상이 삭제되었습니다. 기본 이미지로 표시됩니다." });
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <>
      <AdminSection title="현재 영상">
        {video === undefined && <p className="hc-adm-empty">불러오는 중…</p>}
        {video === null && <p className="hc-adm-empty">등록된 영상이 없습니다. (기본 이미지로 표시됩니다)</p>}
        {video && (
          <div className="hc-adm-media">
            <video
              key={video.id}
              className="hc-adm-video"
              src={`${API_BASE_URL}/uploads/homevideo/${video.fileUrl}`}
              controls
              muted
            />
            <button type="button" className="hc-adm-btn hc-adm-btn--sm hc-adm-btn--danger" onClick={handleReset}>
              영상 삭제
            </button>
          </div>
        )}
      </AdminSection>

      <AdminSection title="영상 바꾸기" desc="새 영상을 올리면 기존 영상은 자동으로 교체됩니다.">
        <form onSubmit={handleUpload}>
          <AdminFieldTable>
            <AdminField label="영상 파일" required hint="용량이 크면 홈 화면이 늦게 뜹니다. 720p 정도로 줄인 영상을 권장합니다.">
              <input className="hc-adm-file" type="file" ref={fileRef} accept="video/*" />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary">영상 교체</button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>
    </>
  );
}
