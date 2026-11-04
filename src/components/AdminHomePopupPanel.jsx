import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/auth.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus, AdminList, AdminRow } from "./AdminUI.jsx";

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
    <>
      <AdminSection
        title={editingId ? "팝업 수정" : "새 팝업 등록"}
        desc='여러 개를 켜 두면 순서 숫자가 작은 것부터 차례로 뜹니다. 내용을 수정하면 "일주일간 보지 않기"를 누른 분에게도 다시 보입니다.'
      >
        <form onSubmit={handleSubmit}>
          <AdminFieldTable>
            <AdminField label="표시">
              <label className="hc-adm-check">
                <input type="checkbox" checked={form.enabled} onChange={setField("enabled")} />
                홈 화면에 띄우기
              </label>
            </AdminField>
            <AdminField label="제목" required>
              <input
                className="hc-adm-input"
                type="text"
                placeholder="예: 하나교회 홈페이지 시범 운영 중"
                value={form.title}
                onChange={setField("title")}
                maxLength={100}
              />
            </AdminField>
            <AdminField label="내용" hint="줄바꿈이 그대로 보입니다.">
              <textarea
                className="hc-adm-textarea"
                placeholder={"예: 불편한 점이나 오류가 있으면 알려주세요.\n문의: 010-0000-0000"}
                value={form.message}
                onChange={setField("message")}
                maxLength={2000}
                rows={5}
              />
            </AdminField>
            <AdminField label="버튼" hint="선택 입력입니다. 링크를 넣으면 버튼 글자도 넣어주세요.">
              <div className="hc-adm-grid2">
                <input
                  className="hc-adm-input"
                  type="text"
                  placeholder="버튼 글자 (예: 오류 제보하기)"
                  value={form.buttonText}
                  onChange={setField("buttonText")}
                  maxLength={30}
                />
                <input
                  className="hc-adm-input"
                  type="text"
                  placeholder="링크 (/inquiry 또는 https://...)"
                  value={form.link}
                  onChange={setField("link")}
                  maxLength={500}
                />
              </div>
            </AdminField>
            <AdminField label="기간" hint="비워 두면 기간 제한 없이 표시됩니다. 종료일 당일까지 보입니다.">
              <div className="hc-adm-range">
                <input
                  className="hc-adm-input hc-adm-input--date"
                  type="date"
                  aria-label="시작일"
                  value={form.startDate}
                  onChange={setField("startDate")}
                />
                <span className="hc-adm-range-sep">~</span>
                <input
                  className="hc-adm-input hc-adm-input--date"
                  type="date"
                  aria-label="종료일"
                  value={form.endDate}
                  onChange={setField("endDate")}
                />
              </div>
            </AdminField>
            <AdminField label="순서" hint="숫자가 작을수록 먼저 뜹니다.">
              <input
                className="hc-adm-input hc-adm-input--num"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={setField("sortOrder")}
              />
            </AdminField>
          </AdminFieldTable>
          <AdminFormActions>
            {editingId && (
              <button type="button" className="hc-adm-btn" onClick={resetForm}>
                취소
              </button>
            )}
            <button type="submit" className="hc-adm-btn hc-adm-btn--primary" disabled={saving}>
              {saving ? "저장 중..." : editingId ? "수정 저장" : "등록"}
            </button>
          </AdminFormActions>
          <AdminStatus status={status} />
        </form>
      </AdminSection>

      <AdminSection title="등록된 팝업" count={popups?.length}>
        <AdminList loading={popups === null} empty={popups?.length === 0} emptyText="등록된 팝업이 없습니다.">
          {popups?.map((p) => {
            const st = statusOf(p);
            return (
              <AdminRow
                key={p.id}
                highlight={editingId === p.id}
                badge={<span className={`hc-adm-badge hc-adm-badge--${st.tone}`}>{st.label}</span>}
                title={p.title}
                meta={`순서 ${p.sortOrder} · ${periodOf(p)}`}
                actions={
                  <>
                    <button type="button" className="hc-adm-btn hc-adm-btn--sm" onClick={() => startEdit(p)}>
                      수정
                    </button>
                    <button type="button" className="hc-adm-btn hc-adm-btn--sm hc-adm-btn--danger" onClick={() => handleDelete(p)}>
                      삭제
                    </button>
                  </>
                }
              />
            );
          })}
        </AdminList>
      </AdminSection>
    </>
  );
}
