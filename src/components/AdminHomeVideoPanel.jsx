import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";

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
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">홈화면 영상 관리</h2>
      <p className="hc-admin-panel-hint">
        홈 화면 맨 위에 재생되는 배경 영상을 바꿀 수 있어요. 새 영상을 올리면 기존 영상은 자동으로 교체됩니다.
      </p>

      {video === undefined && <p className="hc-loading">불러오는 중…</p>}

      {video !== undefined && (
        <div className="hc-admin-homevideo-current">
          <span className="hc-admin-panel-hint">현재 등록된 영상</span>
          {video ? (
            <video
              key={video.id}
              className="hc-admin-homevideo-preview"
              src={`${API_BASE_URL}/uploads/homevideo/${video.fileUrl}`}
              controls
              muted
            />
          ) : (
            <p className="hc-empty">등록된 영상이 없습니다. (기본 이미지로 표시됩니다)</p>
          )}
        </div>
      )}

      <form className="hc-admin-form" onSubmit={handleUpload}>
        <input type="file" ref={fileRef} accept="video/*" />
        <button type="submit" className="hc-admin-btn">영상 교체</button>
        {video && (
          <button
            type="button"
            className="hc-admin-btn hc-admin-btn--danger"
            onClick={handleReset}
          >
            영상 삭제
          </button>
        )}
      </form>

      {status && (
        <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
      )}
    </section>
  );
}