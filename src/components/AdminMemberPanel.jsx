import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/auth.js";
import {
  AdminSection,
  AdminField,
  AdminFieldTable,
  AdminFormActions,
  AdminStatus,
  AdminList,
  AdminRow,
  formatDate,
} from "./AdminUI.jsx";

// 교인 관리: 가입한 회원을 교인 명부와 대조하고, 잘못된 정보는 고치고, 교인이 아니면 삭제
// (가입하면 바로 회원이 되고, 관리자가 나중에 확인하는 방식)

// 01012345678 → 010-1234-5678
function formatPhone(p) {
  if (!p) return "";
  return p.length === 11 ? `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}` : `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
}

// 19900101 → 1990.01.01
function formatBirth(b) {
  return b?.length === 8 ? `${b.slice(0, 4)}.${b.slice(4, 6)}.${b.slice(6)}` : b;
}

const EMPTY_FORM = { name: "", birthDate: "", phoneNumber: "", smsReceive: false };

export default function AdminMemberPanel({ token, onAuthExpired }) {
  const [members, setMembers] = useState(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // 고치는 중인 회원
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);

  const fail = (err, msg) => {
    if (err?.message === "AUTH_EXPIRED") return onAuthExpired();
    setStatus({ ok: false, msg });
  };

  const load = async () => {
    try {
      const res = await authFetch(token, "/api/admin/members");
      if (!res.ok) throw new Error();
      setMembers(await res.json());
    } catch (err) {
      fail(err, "교인 목록을 불러오지 못했습니다.");
      setMembers([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (m) => {
    setEditing(m);
    setForm({ name: m.name, birthDate: m.birthDate, phoneNumber: m.phoneNumber, smsReceive: m.smsReceive });
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const body = { ...form, name: form.name.trim(), phoneNumber: form.phoneNumber.replace(/[^0-9]/g, "") };
    try {
      const res = await authFetch(token, `/api/admin/members/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return setStatus({ ok: false, msg: data.message || "저장에 실패했습니다." });
      }
      setStatus({ ok: true, msg: `${body.name}님의 정보를 고쳤습니다.` });
      cancelEdit();
      load();
    } catch (err) {
      fail(err, "저장에 실패했습니다.");
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`${m.name}(${formatPhone(m.phoneNumber)})님을 삭제할까요?\n삭제하면 되돌릴 수 없고, 다시 이용하려면 새로 가입해야 합니다.`)) return;
    try {
      const res = await authFetch(token, `/api/admin/members/${m.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return setStatus({ ok: false, msg: data.message || "삭제에 실패했습니다." });
      }
      setStatus({ ok: true, msg: `${m.name}님을 삭제했습니다.` });
      if (editing?.id === m.id) cancelEdit();
      load();
    } catch (err) {
      fail(err, "삭제에 실패했습니다.");
    }
  };

  const keyword = query.trim().replace(/-/g, "");
  const shown = (members || []).filter(
    (m) => !keyword || m.name.includes(keyword) || m.phoneNumber.includes(keyword) || m.loginId.includes(keyword)
  );

  return (
    <>
      {editing && (
        <AdminSection title={`${editing.name}님 정보 고치기`} desc="오타 등을 바로잡는 용도입니다. 전화번호는 문자 인증 없이 바뀝니다.">
          <form onSubmit={handleSave}>
            <AdminFieldTable>
              <AdminField label="이름" required>
                <input className="hc-adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </AdminField>
              <AdminField label="생년월일" required hint="8자리 숫자 (예: 19900101)">
                <input
                  className="hc-adm-input hc-adm-input--date"
                  inputMode="numeric"
                  maxLength={8}
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value.replace(/[^0-9]/g, "") })}
                />
              </AdminField>
              <AdminField label="전화번호" required>
                <input
                  className="hc-adm-input hc-adm-input--phone"
                  inputMode="numeric"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </AdminField>
              <AdminField label="주보 문자">
                <label className="hc-adm-check">
                  <input
                    type="checkbox"
                    checked={form.smsReceive}
                    onChange={(e) => setForm({ ...form, smsReceive: e.target.checked })}
                  />
                  주보 알림 문자 받기
                </label>
              </AdminField>
            </AdminFieldTable>
            <AdminFormActions>
              <button type="button" className="hc-adm-btn" onClick={cancelEdit}>
                취소
              </button>
              <button type="submit" className="hc-adm-btn hc-adm-btn--primary">
                저장
              </button>
            </AdminFormActions>
          </form>
        </AdminSection>
      )}

      <AdminSection
        title="가입한 교인"
        count={members ? members.length : null}
        desc="교인 명부와 대조해서, 교인이 아니거나 잘못 가입한 경우 삭제하세요. 이름·전화번호 등 개인정보이므로 외부에 공유하지 마세요."
      >
        <input
          className="hc-adm-input hc-adm-member-search"
          placeholder="이름, 전화번호, 아이디로 찾기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <AdminStatus status={status} />
        <AdminList
          loading={members === null}
          empty={shown.length === 0}
          emptyText={keyword ? "찾는 교인이 없습니다." : "가입한 교인이 없습니다."}
        >
          {shown.map((m) => (
            <AdminRow
              key={m.id}
              highlight={editing?.id === m.id}
              badge={
                <>
                  {m.admin && <span className="hc-adm-badge">관리자</span>}
                  {m.kakao && <span className="hc-adm-badge hc-adm-badge--wait">카카오</span>}
                  {m.smsReceive && <span className="hc-adm-badge hc-adm-badge--on">주보 문자</span>}
                </>
              }
              title={`${m.name} · ${formatPhone(m.phoneNumber)}`}
              meta={`생년월일 ${formatBirth(m.birthDate)} · 아이디 ${m.loginId} · 가입 ${formatDate(m.createdAt) || "-"}`}
              actions={
                <>
                  <button type="button" className="hc-adm-btn hc-adm-btn--sm" onClick={() => startEdit(m)}>
                    수정
                  </button>
                  {!m.admin && (
                    <button type="button" className="hc-adm-btn hc-adm-btn--sm hc-adm-btn--danger" onClick={() => handleDelete(m)}>
                      삭제
                    </button>
                  )}
                </>
              }
            />
          ))}
        </AdminList>
      </AdminSection>
    </>
  );
}
