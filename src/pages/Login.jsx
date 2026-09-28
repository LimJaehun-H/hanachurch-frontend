import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";
import { setMemberSession } from "../utils/memberAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = loginId.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "로그인에 실패했습니다.");
      }

      setMemberSession(data.token, loginId.trim());
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hc-page">
      <Header variant="solid" />

      <main className="hc-auth-page">
        <div className="hc-auth-heading">
          <h1 className="hc-auth-title">로그인</h1>
          <p className="hc-auth-desc">가입하신 아이디와 비밀번호로 로그인해주세요.</p>
        </div>

        <form className="hc-auth-card" onSubmit={handleSubmit}>
          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="loginId">아이디</label>
            <input
              id="loginId"
              type="text"
              className="hc-auth-input"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              className="hc-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="hc-auth-error">{error}</p>}

          <button type="submit" className="hc-auth-submit" disabled={!canSubmit}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>

          <p className="hc-auth-switch">
            아직 계정이 없으신가요? <Link to="/signup/agree">회원가입</Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
