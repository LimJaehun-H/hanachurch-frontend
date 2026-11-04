import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { SITE_IMAGE_GROUPS } from "../config.js";
import { authFetch } from "../utils/auth.js";
import { compressImage } from "../utils/imageCompress.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus } from "./AdminUI.jsx";

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

    setStatus({ ok: true, msg: "사진 용량을 줄이는 중..." });
    const formData = new FormData();
    formData.append("file", await compressImage(file));

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

  // 드롭다운을 section(홈 화면/교회소개/예배안내 등)별로 묶어서 보여주기 위한 그룹핑
  const groupedBySection = SITE_IMAGE_GROUPS.reduce((acc, g) => {
    (acc[g.section] = acc[g.section] || []).push(g);
    return acc;
  }, {});

  const handlePreview = () => {
    if (selectedGroup?.page) {
      window.open(selectedGroup.page, "_blank");
    }
  };

  return (
    <>
      <AdminSection title="사진 위치 고르기">
        <AdminFieldTable>
          <AdminField label="위치">
            <div className="hc-adm-inline">
              <select
                className="hc-adm-input hc-adm-select"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                {Object.entries(groupedBySection).map(([section, items]) => (
                  <optgroup key={section} label={section}>
                    {items.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {selectedGroup?.page && (
                <button type="button" className="hc-adm-btn" onClick={handlePreview}>
                  쓰이는 페이지 보기 ↗
                </button>
              )}
            </div>
          </AdminField>
        </AdminFieldTable>
      </AdminSection>

      <AdminSection
        title="현재 사진"
        count={images.length}
        desc={selectedGroup.type === "gallery" ? "◀ ▶ 버튼으로 보이는 순서를 바꿀 수 있습니다." : null}
      >
        {images.length === 0 && <p className="hc-adm-empty">등록된 사진이 없습니다.</p>}
        {images.length > 0 && (
          <div className="hc-adm-thumbs">
            {images.map((img, i) => (
              <div key={img.id} className="hc-adm-thumb">
                <img src={`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(img.fileUrl)}`} alt="" />
                {(selectedGroup.type === "gallery" || selectedGroup.deletable) && (
                  <div className="hc-adm-thumb-actions">
                    {selectedGroup.type === "gallery" && (
                      <button type="button" aria-label="앞으로" disabled={i === 0} onClick={() => handleMove(img.id, "up")}>
                        ◀
                      </button>
                    )}
                    <button type="button" className="hc-adm-thumb-delete" onClick={() => handleDelete(img.id)}>
                      삭제
                    </button>
                    {selectedGroup.type === "gallery" && (
                      <button
                        type="button"
                        aria-label="뒤로"
                        disabled={i === images.length - 1}
                        onClick={() => handleMove(img.id, "down")}
                      >
                        ▶
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title={selectedGroup.type === "single" ? "사진 교체" : "사진 추가"}>
        <form onSubmit={handleUpload}>
          <AdminFieldTable>
            <AdminField label="사진 파일" required hint="큰 사진은 자동으로 용량을 줄여서 올립니다.">
              <input className="hc-adm-file" type="file" ref={fileRef} accept="image/*" />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary">
              {selectedGroup.type === "single" ? "교체" : "추가"}
            </button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>
    </>
  );
}
