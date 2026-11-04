import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/auth.js";

// 홈 화면 안내 팝업 관리 (여러 개 등록 가능, 순서가 작은 것부터 차례로 뜸)
const EMPTY_FORM = {
  enabled: true,
  title: "",
  message: "",
  buttonText: "",
  link: "",
  startDate: "",
  endDate: "",
  sortOrder: 0,
};

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 목록에 보여줄 현재 상태
function statusOf(p) {
  if (!p.enabled) return { label: "꺼짐", tone: "off" };
  const today = todayString();
  if (p.startDate && today < p.startDate) return { label: "시작 전", tone: "wait" };
  if (p.endDate && today > p.endDate) return { label: "기간 종료", tone: "off" };
  return { label: "표시 중", tone: "on" };
}

function periodOf(p) {
  if (!p.startDate && !p.endDate) return "기간 제한 없음";
  return `${p.startDate || "처음부터"} ~ ${p.endDate || "계속"}`;
}

export default function AdminHomePopupPanel({ token, onAuthExpired }) {
  const [popups, setPopups] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await authFetch(token, "/api/home-popups/admin");
      if (!res.ok) throw new Error();
      setPopups(await res.json());
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setPopups([]);
      setStatus({ ok: false, msg: "팝업 목록을 불러오지 못했습니다." });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (p) => {
    setForm({
      enabled: p.enabled,
      title: p.title || "",
      message: p.message || "",
      buttonText: p.buttonText || "",
      link: p.link || "",
      startDate: p.startDate || "",
      endDate: p.endDate || "",
      sortOrder: p.sortOrder ?? 0,
    });
    setEditingId(p.id);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setStatus({ ok: false, msg: "제목을 입력해주세요." });
      return;
    }
    if (form.link.trim() && !form.buttonText.trim()) {
      setStatus({ ok: false, msg: "링크를 넣으면 버튼 글자도 입력해주세요." });
      return;
    }

    const body = {
      enabled: form.enabled,
      title: form.title.trim(),
      message: form.message,
      buttonText: form.buttonText.trim(),
      link: form.link.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      const res = await authFetch(
        token,
        editingId ? `/api/home-popups/${editingId}` : "/api/home-popups",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "저장에 실패했습니다.");
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

  const handleDelete = async (p) => {
    if (!window.confirm(`"${p.title}" 팝업을 삭제할까요?`)) return;
    try {
      const res = await authFetch(token, `/api/home-popups/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (editingId === p.id) resetForm();
      setStatus({ ok: true, msg: "삭제되었습니다." });
      load();
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: "삭제에 실패했습니다." });
    }
  };

  return (
    <section className="hc-admin-panel">
      <h2 className="hc-admin-panel-title">
        {editingId ? "팝업 수정" : "새 팝업 등록"}
      </h2>

      <form className="hc-admin-form" onSubmit={handleSubmit}>
        <label className="hc-admin-category-option">
          <input type="checkbox" checked={form.enabled} onChange={setField("enabled")} />
          홈 화면에 띄우기
        </label>

        <input
          type="text"
          placeholder="제목 (예: 하나교회 홈페이지 시범 운영 중)"
          value={form.title}
          onChange={setField("title")}
          maxLength={100}
        />
        <textarea
          placeholder={"내용 (줄바꿈이 그대로 보입니다)\n예: 불편한 점이나 오류가 있으면 알려주세요.\n문의: 010-0000-0000"}
          value={form.message}
          onChange={setField("message")}
          maxLength={2000}
          rows={5}
        />

        <div className="hc-admin-popup-row">
          <input
            type="text"
            placeholder="버튼 글자 (선택, 예: 오류 제보하기)"
            value={form.buttonText}
            onChange={setField("buttonText")}
            maxLength={30}
          />
          <input
            type="text"
            placeholder="버튼 링크 (선택, /inquiry 또는 https://...)"
            value={form.link}
            onChange={setField("link")}
            maxLength={500}
          />
        </div>

        <div className="hc-admin-popup-row">
          <label className="hc-admin-popup-field">
            <span>시작일 (선택)</span>
            <input type="date" value={form.startDate} onChange={setField("startDate")} />
          </label>
          <label className="hc-admin-popup-field">
            <span>종료일 (선택, 이날까지 표시)</span>
            <input type="date" value={form.endDate} onChange={setField("endDate")} />
          </label>
          <label className="hc-admin-popup-field hc-admin-popup-field--narrow">
            <span>순서</span>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={setField("sortOrder")}
            />
          </label>
        </div>

        <div className="hc-admin-popup-actions">
          <button type="submit" className="hc-admin-btn" disabled={saving}>
            {saving ? "저장 중..." : editingId ? "수정 저장" : "등록"}
          </button>
          {editingId && (
            <button type="button" className="hc-admin-btn hc-admin-btn--ghost" onClick={resetForm}>
              취소
            </button>
          )}
        </div>
      </form>
      <p className="hc-admin-hint hc-admin-popup-hint">
        여러 개를 켜 두면 순서 숫자가 작은 것부터 차례로 뜹니다. 내용을 수정하면 "일주일간 보지 않기"를 누른 분에게도 다시 보입니다.
      </p>

      {status && (
        <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
      )}

      {popups === null && <p className="hc-loading">불러오는 중…</p>}
      {popups && popups.length === 0 && <p className="hc-empty">등록된 팝업이 없습니다.</p>}
      {popups && popups.length > 0 && (
        <ul className="hc-admin-list">
          {popups.map((p) => {
            const st = statusOf(p);
            return (
              <li key={p.id} className="hc-admin-list-row">
                <div className="hc-admin-popup-info">
                  <span className={`hc-admin-popup-badge hc-admin-popup-badge--${st.tone}`}>{st.label}</span>
                  <strong>{p.title}</strong>
                  <span className="hc-admin-popup-meta">
                    순서 {p.sortOrder} · {periodOf(p)}
                  </span>
                </div>
                <div className="hc-admin-popup-actions">
                  <button type="button" className="hc-admin-btn hc-admin-btn--ghost" onClick={() => startEdit(p)}>
                    수정
                  </button>
                  <button type="button" className="hc-admin-btn hc-admin-btn--danger" onClick={() => handleDelete(p)}>
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
