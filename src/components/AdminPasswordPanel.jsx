import React, { useState } from "react";
import { authFetch } from "../utils/auth.js";
import { AdminSection, AdminField, AdminFieldTable, AdminFormActions, AdminStatus } from "./AdminUI.jsx";

export default function AdminPasswordPanel({ token, onAuthExpired }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 8) {
      setStatus({ ok: false, msg: "새 비밀번호는 8자 이상으로 입력해주세요." });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setStatus({ ok: false, msg: "새 비밀번호가 서로 일치하지 않습니다." });
      return;
    }

    try {
      const res = await authFetch(token, "/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "비밀번호 변경에 실패했습니다.");
      }
      setStatus({ ok: true, msg: "비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요." });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      if (err.message === "AUTH_EXPIRED") return onAuthExpired();
      setStatus({ ok: false, msg: err.message });
    }
  };

  return (
    <AdminSection title="새 비밀번호 설정" desc="바꾼 비밀번호는 다음 로그인부터 사용합니다.">
      <form onSubmit={handleSubmit}>
        <AdminFieldTable>
          <AdminField label="현재 비밀번호" required>
            <input
              className="hc-adm-input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="새 비밀번호" required hint="8자 이상으로 입력해주세요.">
            <input
              className="hc-adm-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </AdminField>
          <AdminField label="새 비밀번호 확인" required>
            <input
              className="hc-adm-input"
              type="password"
              autoComplete="new-password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              required
            />
          </AdminField>
        </AdminFieldTable>
        <AdminFormActions>
          <button type="submit" className="hc-adm-btn hc-adm-btn--primary">비밀번호 변경</button>
        </AdminFormActions>
        <AdminStatus status={status} />
      </form>
    </AdminSection>
  );
}
