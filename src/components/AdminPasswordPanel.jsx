import React, { useState } from "react";
import { authFetch } from "../utils/auth.js";

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
    <section>
      <h2 className="hc-admin-panel-title">비밀번호 변경</h2>
      <form className="hc-admin-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="새 비밀번호 (8자 이상)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          required
        />
        <button type="submit" className="hc-admin-btn">비밀번호 변경</button>
        {status && (
          <p className={`hc-admin-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
        )}
      </form>
    </section>
  );
}