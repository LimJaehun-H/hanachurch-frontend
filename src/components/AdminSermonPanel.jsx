import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { authFetch } from "../utils/auth.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus, AdminList, AdminRow, formatDate } from "./AdminUI.jsx";

const CATEGORY_LABELS = {
  SUNDAY: "주일예배",
  DAWN: "새벽예배",
};

export default function AdminSermonPanel({ token, onAuthExpired }) {
  const [sermons, setSermons] = useState({ SUNDAY: null, DAWN: null });
  const [category, setCategory] = useState("SUNDAY");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [status, setStatus] = useState(null);

  const load = (cat) => {
    fetch(`${API_BASE_URL}/api/sermons?category=${cat}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSermons((prev) => ({ ...prev, [cat]: data })))
      .catch(() => setSermons((prev) => ({ ...prev, [cat]: [] })));
  };

  useEffect(() => {
    load("SUNDAY");
    load("DAWN");
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      setStatus({ ok: false, msg: "녹음 파일을 선택해주세요." });
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("audioFile", audioFile);

    try {
      const res = await authFetch(token, "/api/sermons", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "등록에 실패했습니다.");
      }
      setStatus({ ok: true, msg: "등록되었습니다." });
      setTitle("");
      setContent("");
      setAudioFile(null);
      load(category);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: err.message });
    }
  };

  const handleDelete = async (id, cat) => {
    if (!window.confirm("이 말씀을 삭제할까요?")) return;
    try {
      const res = await authFetch(token, `/api/sermons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load(cat);
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <>
      <AdminSection title="새 말씀 올리기">
        <form onSubmit={handleCreate}>
          <AdminFieldTable>
            <AdminField label="예배 구분" required>
              <div className="hc-adm-segment" role="radiogroup">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <label key={value} className={`hc-adm-segment-item ${category === value ? "hc-adm-segment-item--on" : ""}`}>
                    <input
                      type="radio"
                      name="sermonCategory"
                      value={value}
                      checked={category === value}
                      onChange={() => setCategory(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </AdminField>
            <AdminField label="제목" required>
              <input
                className="hc-adm-input"
                type="text"
                placeholder="설교 제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </AdminField>
            <AdminField label="내용" hint="선택 입력입니다. 성경 본문이나 설교 요약을 적을 수 있고, 비워 두면 화면에 표시되지 않습니다.">
              <textarea
                className="hc-adm-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </AdminField>
            <AdminField label="녹음 파일" required>
              <input
                className="hc-adm-file"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary">등록</button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>

      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
        <AdminSection key={value} title={label} count={sermons[value]?.length}>
          <AdminList
            loading={sermons[value] === null}
            empty={sermons[value]?.length === 0}
            emptyText="등록된 말씀이 없습니다."
          >
            {sermons[value]?.map((s) => (
              <AdminRow
                key={s.id}
                title={s.title}
                meta={formatDate(s.createdAt)}
                actions={
                  <button
                    type="button"
                    className="hc-adm-btn hc-adm-btn--sm hc-adm-btn--danger"
                    onClick={() => handleDelete(s.id, value)}
                  >
                    삭제
                  </button>
                }
              />
            ))}
          </AdminList>
        </AdminSection>
      ))}
    </>
  );
}
