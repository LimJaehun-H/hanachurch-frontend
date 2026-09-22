import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { SITE_IMAGE_GROUPS } from "../config.js";
import { authFetch } from "../utils/auth.js";

export default function AdminSiteImagePanel({ token, onAuthExpired }) {
  const [selectedKey, setSelectedKey] = useState(SITE_IMAGE_GROUPS[0].key);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);

  const selectedGroup = SITE_IMAGE_GROUPS.find((g) => g.key === selectedKey);

  const loadImages = (groupKey) => {
    fetch(`${API_BASE_URL}/api/site-images/${groupKey}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setImages)
      .catch(() => setImages([]));
  };

  useEffect(() => {
    loadImages(selectedKey);
    setStatus(null);
  }, [selectedKey]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus({ ok: false, msg: "사진을 선택해주세요." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const method = selectedGroup.type === "single" ? "PUT" : "POST";

    try {
      const res = await authFetch(token, `/api/site-images/${selectedKey}`, {
        method,
        body: formData,
      });
      if (!res.ok) throw new Error();
      setStatus({ ok: true, msg: "저장되었습니다." });
      if (fileRef.current) fileRef.current.value = "";
      loadImages(selectedKey);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "업로드에 실패했습니다." });
    }
  };
  const handleMove = async (id, direction) => {
    try {
      const res = await authFetch(token, `/api/site-images/item/${id}/move?direction=${direction}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      loadImages(selectedKey);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "순서 변경에 실패했습니다." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 사진을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/site-images/item/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      loadImages(selectedKey);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">사이트 이미지 관리</h2>

      <select
        className="hc-admin-siteimage-select"
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
      >
        {SITE_IMAGE_GROUPS.map((g) => (
          <option key={g.key} value={g.key}>
            {g.label}
          </option>
        ))}
      </select>

      <div className="hc-admin-siteimage-current">
        {images.length === 0 && <p className="hc-empty">등록된 사진이 없습니다.</p>}
        {images.map((img, i) => (
          <div key={img.id} className="hc-admin-siteimage-thumb">
            <img src={`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(img.fileUrl)}`} alt="" />
            {selectedGroup.type === "gallery" && (
              <>
                <div className="hc-admin-siteimage-move">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => handleMove(img.id, "up")}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    disabled={i === images.length - 1}
                    onClick={() => handleMove(img.id, "down")}
                  >
                    ▶
                  </button>
                </div>
                <button type="button" onClick={() => handleDelete(img.id)}>
                  삭제
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <form className="hc-admin-form" onSubmit={handleUpload}>
        <input type="file" ref={fileRef} accept="image/*" />
        <button type="submit" className="hc-admin-btn">
          {selectedGroup.type === "single" ? "교체" : "추가"}
        </button>
      </form>

      {status && <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>}
    </section>
  );
}