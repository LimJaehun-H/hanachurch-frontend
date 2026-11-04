import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";
import { compressImage } from "../utils/imageCompress.js";
import { isPdf, pdfToImages } from "../utils/pdfToImages.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus, AdminList, AdminRow, formatDate } from "./AdminUI.jsx";

export default function AdminBulletinPanel({ token, onAuthExpired }) {
  const [bulletins, setBulletins] = useState(null);
  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    fetch(`${API_BASE_URL}/api/bulletins`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setBulletins)
      .catch(() => setBulletins([]));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const files = fileRef.current?.files;
    if (!files || files.length === 0 || !title.trim() || !serviceDate) {
      setStatus({ ok: false, msg: "파일, 제목, 예배일을 모두 입력해주세요." });
      return;
    }

    setBusy(true);
    try {
      // PDF는 페이지별 JPG로, 사진은 용량을 줄여서 올림 (선택한 순서 유지)
      const uploadFiles = [];
      let pdfFailed = false;
      for (const file of Array.from(files)) {
        if (isPdf(file)) {
          setStatus({ ok: true, msg: "PDF를 이미지로 바꾸는 중..." });
          try {
            uploadFiles.push(...(await pdfToImages(file)));
          } catch {
            pdfFailed = true;
            uploadFiles.push(file); // 변환에 실패하면 원본 PDF를 그대로 올림
          }
        } else {
          setStatus({ ok: true, msg: "사진 용량을 줄이는 중..." });
          uploadFiles.push(await compressImage(file));
        }
      }

      setStatus({ ok: true, msg: "업로드 중..." });
      const formData = new FormData();
      uploadFiles.forEach((file) => formData.append("files", file));
      formData.append("title", title);
      formData.append("serviceDate", serviceDate);

      const res = await authFetch(token, "/api/bulletins", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      setStatus({
        ok: true,
        msg: pdfFailed
          ? "등록되었습니다. (PDF를 이미지로 바꾸지 못해 원본 PDF로 올렸습니다)"
          : "등록되었습니다.",
      });
      setTitle("");
      setServiceDate("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "등록에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 주보를 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/bulletins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <>
      <AdminSection title="새 주보 올리기">
        <form onSubmit={handleCreate}>
          <AdminFieldTable>
            <AdminField label="제목" required>
              <input
                className="hc-adm-input"
                type="text"
                placeholder="예: 2026년 8월 1주 주보"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </AdminField>
            <AdminField label="예배일" required>
              <input
                className="hc-adm-input hc-adm-input--date"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </AdminField>
            <AdminField
              label="파일"
              required
              hint="PDF를 올리면 쪽마다 사진으로 자동 변환됩니다. 사진을 여러 장 고르면 고른 순서대로 한 주보에 저장됩니다."
            >
              <input className="hc-adm-file" type="file" ref={fileRef} accept="application/pdf,image/*" multiple />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary" disabled={busy}>
              {busy ? "처리 중..." : "업로드"}
            </button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>

      <AdminSection title="등록된 주보" count={bulletins?.length}>
        <AdminList loading={bulletins === null} empty={bulletins?.length === 0} emptyText="등록된 주보가 없습니다.">
          {bulletins?.map((b) => (
            <AdminRow
              key={b.id}
              title={b.title}
              meta={`예배일 ${formatDate(b.serviceDate)} · 파일 ${b.files?.length ?? 0}개`}
              actions={
                <button type="button" className="hc-adm-btn hc-adm-btn--sm hc-adm-btn--danger" onClick={() => handleDelete(b.id)}>
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
