import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";
import { setMemberSession } from "../utils/memberAuth.js";
import { checkKakaoState, kakaoRedirectUri, KAKAO_SIGNUP_KEY } from "../utils/kakao.js";

// 카카오 동의 후 돌아오는 주소 (/login/kakao?code=...&state=...)
export default function KakaoCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const started = useRef(false); // 개발 모드에서 두 번 실행되어 같은 코드를 두 번 쓰는 것 방지

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (params.get("error")) {
      setError("카카오 로그인을 취소했습니다.");
      return;
    }
    if (!code || !checkKakaoState(params.get("state"))) {
      setError("잘못된 접근입니다. 다시 시도해주세요.");
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/kakao/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri: kakaoRedirectUri() }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "카카오 로그인에 실패했습니다.");
        if (data.status === "LOGIN") {
          setMemberSession(data.token, data.loginId, data.name);
          navigate("/", { replace: true });
        } else {
          sessionStorage.setItem(
            KAKAO_SIGNUP_KEY,
            JSON.stringify({ signupToken: data.signupToken, name: data.name, phoneNumber: data.phoneNumber })
          );
          navigate("/signup/kakao", { replace: true });
        }
      })
      .catch((err) => setError(err.message));
  }, [navigate]);

  return (
    <div className="hc-page">
      <Header variant="solid" />
      <main className="hc-auth-page">
        <div className="hc-auth-heading">
          <h1 className="hc-auth-title">카카오 로그인</h1>
          {!error && <p className="hc-auth-desc">로그인 중입니다…</p>}
        </div>
        {error && (
          <div className="hc-auth-card">
            <p className="hc-auth-error">{error}</p>
            <p className="hc-auth-switch">
              <Link to="/login">로그인 화면으로 돌아가기</Link>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
