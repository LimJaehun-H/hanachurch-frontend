import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";
import { compressImage } from "../utils/imageCompress.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus } from "./AdminUI.jsx";

// 교회부서 사진 관리: 부서 소개 페이지(/ministry/:id)에 들어가는 사진
// 1번째 사진 = 맨 위 큰 사진, 2번째 = 본문 중간, 3번째부터 = 아래 사진 모음
const POSITION = ["맨 위 큰 사진", "본문 중간 사진"];

// 부서 나무에서 소개 페이지가 있는 부서만 "부 › 묶음 › 팀" 이름으로 뽑기
function pagesFromTree(root) {
  const list = [];
  const walk = (n, path) => {
    const here = n.id === "root" ? [] : [...path, n.name];
    if (n.hasPage) list.push({ id: n.id, label: here.join(" › ") });
    (n.children || []).forEach((c) => walk(c, here));
  };
  walk(root, []);
  return list;
}

export default function AdminMinistryPhotoPanel({ token, onAuthExpired }) {
  const [pages, setPages] = useState([]);
  const [slug, setSlug] = useState("");
  const [photos, setPhotos] = useState([]);
  const [captions, setCaptions] = useState({}); // 사진 id → 고치는 중인 설명
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const [newCaption, setNewCaption] = useState("");

  const fail = (err, msg) => {
    if (err?.message === "AUTH_EXPIRED") return onAuthExpired();
    setStatus({ ok: false, msg });
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ministries/tree`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((root) => {
        const list = pagesFromTree(root);
        setPages(list);
        if (list.length) setSlug(list[0].id);
      })
      .catch(() => setStatus({ ok: false, msg: "부서 목록을 불러오지 못했습니다." }));
  }, []);

  const load = async (s = slug) => {
    if (!s) return;
    try {
      const res = await authFetch(token, `/api/admin/ministries/${s}/photos`);
      if (!res.ok) throw new Error();
      const list = await res.json();
      setPhotos(list);
      setCaptions(Object.fromEntries(list.map((p) => [p.id, p.caption || ""])));
    } catch (err) {
      fail(err, "사진을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    setStatus(null);
    load(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files || []);
    if (!files.length) return setStatus({ ok: false, msg: "사진을 선택해주세요." });
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        setStatus({ ok: true, msg: `사진 올리는 중… (${i + 1}/${files.length})` });
        const form = new FormData();
        form.append("file", await compressImage(files[i]));
        if (newCaption.trim() && files.length === 1) form.append("caption", newCaption.trim());
        const res = await authFetch(token, `/api/admin/ministries/${slug}/photos`, { method: "POST", body: form });
        if (!res.ok) throw new Error();
      }
      setStatus({ ok: true, msg: "저장되었습니다." });
      setNewCaption("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      fail(err, "업로드에 실패했습니다.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const saveCaption = async (id) => {
    try {
      const res = await authFetch(token, `/api/admin/ministries/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: captions[id] || "" }),
      });
      if (!res.ok) throw new Error();
      setStatus({ ok: true, msg: "설명을 저장했습니다." });
      load();
    } catch (err) {
      fail(err, "설명 저장에 실패했습니다.");
    }
  };

  const move = async (id, direction) => {
    try {
      const res = await authFetch(token, `/api/admin/ministries/photos/${id}/move?direction=${direction}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      load();
    } catch (err) {
      fail(err, "순서 변경에 실패했습니다.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("이 사진을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/admin/ministries/photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load();
    } catch (err) {
      fail(err, "삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <AdminSection title="부서 고르기" desc="소개 페이지가 있는 부서만 보입니다.">
        <AdminFieldTable>
          <AdminField label="부서">
            <div className="hc-adm-inline">
              <select className="hc-adm-input hc-adm-select" value={slug} onChange={(e) => setSlug(e.target.value)}>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              {slug && (
                <button type="button" className="hc-adm-btn" onClick={() => window.open(`/ministry/${slug}`, "_blank")}>
                  소개 페이지 보기 ↗
                </button>
              )}
            </div>
          </AdminField>
        </AdminFieldTable>
      </AdminSection>

      <AdminSection
        title="현재 사진"
        count={photos.length}
        desc="1번째는 맨 위 큰 사진, 2번째는 본문 중간, 3번째부터는 아래 사진 모음에 들어갑니다. ◀ ▶로 순서를 바꿀 수 있습니다."
      >
        {photos.length === 0 && <p className="hc-adm-empty">등록된 사진이 없습니다.</p>}
        {photos.length > 0 && (
          <div className="hc-adm-thumbs">
            {photos.map((p, i) => (
              <div key={p.id} className="hc-adm-thumb">
                <img src={`${API_BASE_URL}${p.url}`} alt="" />
                <div className="hc-adm-thumb-meta">
                  <span className="hc-adm-thumb-pos">{POSITION[i] || "아래 사진 모음"}</span>
                  <input
                    className="hc-adm-input hc-adm-thumb-caption"
                    placeholder="사진 설명 (선택)"
                    maxLength={100}
                    value={captions[p.id] ?? ""}
                    onChange={(e) => setCaptions((c) => ({ ...c, [p.id]: e.target.value }))}
                    onBlur={() => (captions[p.id] || "") !== (p.caption || "") && saveCaption(p.id)}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                </div>
                <div className="hc-adm-thumb-actions">
                  <button type="button" aria-label="앞으로" disabled={i === 0} onClick={() => move(p.id, "up")}>
                    ◀
                  </button>
                  <button type="button" className="hc-adm-thumb-delete" onClick={() => remove(p.id)}>
                    삭제
                  </button>
                  <button type="button" aria-label="뒤로" disabled={i === photos.length - 1} onClick={() => move(p.id, "down")}>
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>

      <AdminSection title="사진 추가">
        <form onSubmit={handleUpload}>
          <AdminFieldTable>
            <AdminField label="사진 파일" required hint="여러 장을 한 번에 고를 수 있습니다. 큰 사진은 자동으로 용량을 줄여서 올립니다.">
              <input className="hc-adm-file" type="file" ref={fileRef} accept="image/*" multiple />
            </AdminField>
            <AdminField label="사진 설명" hint="한 장만 올릴 때 적용됩니다. 여러 장은 올린 뒤 사진마다 적을 수 있습니다.">
              <input
                className="hc-adm-input"
                placeholder="예: 주일 점심 배식"
                maxLength={100}
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
              />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary" disabled={busy || !slug}>
              {busy ? "올리는 중…" : "추가"}
            </button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>
    </>
  );
}
