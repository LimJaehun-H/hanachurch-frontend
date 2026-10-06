import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";
import { getMemberToken, clearMemberSession, memberAuthFetch } from "../utils/memberAuth.js";

// 01012345678 → 010-****-5678
function maskPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 10) return phone;
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

// "2026-09-30T11:05:12.123456" → "2026.09.30 11:05"
function formatDateTime(value) {
  if (!value) return "";
  const [date, time = ""] = value.split("T");
  return `${date.replaceAll("-", ".")} ${time.slice(0, 5)}`;
}

export default function MyPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 회원 탈퇴
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  // 토큰 만료/무효(401, 403)면 세션을 지우고 로그인 페이지로
  const handleAuthError = (res) => {
    if (res.status === 401 || res.status === 403) {
      clearMemberSession();
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 로그인 안 한 상태로 직접 들어오면 로그인 페이지로
    if (!getMemberToken()) {
      navigate("/login", { replace: true });
      return;
    }

    memberAuthFetch(`${API_BASE_URL}/api/members/me`)
      .then(async (res) => {
        if (handleAuthError(res)) return;
        if (!res.ok) throw new Error("내 정보를 불러오지 못했습니다.");
        setMe(await res.json());
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleSms = async () => {
    if (!me || saving) return;
    const next = !me.smsReceive;

    setSaving(true);
    setMessage("");
    try {
      const res = await memberAuthFetch(`${API_BASE_URL}/api/members/me/sms-receive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // "뒤집어줘"가 아니라 "이 값으로 바꿔줘"를 보냄 (중복 요청돼도 결과 동일)
        body: JSON.stringify({ smsReceive: next }),
      });
      if (handleAuthError(res)) return;
      if (!res.ok) throw new Error("변경에 실패했습니다. 잠시 후 다시 시도해주세요.");

      // 서버가 돌려준 최신 상태(MeResponse)로 화면 갱신
      setMe(await res.json());
      setMessage(next ? "주보 문자 수신에 동의하셨습니다." : "주보 문자 수신을 해제하셨습니다.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (withdrawing) return;
    if (!withdrawPassword) {
      setWithdrawError("비밀번호를 입력해주세요.");
      return;
    }
    if (!window.confirm("정말 탈퇴하시겠습니까? 탈퇴 후에는 되돌릴 수 없습니다.")) return;

    setWithdrawing(true);
    setWithdrawError("");
    try {
      const res = await memberAuthFetch(`${API_BASE_URL}/api/members/me/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: withdrawPassword }),
      });
      if (handleAuthError(res)) return;
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }

      // 성공(204): 저장된 로그인 정보 삭제 후 홈으로
      clearMemberSession();
      alert("회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");
      navigate("/", { replace: true });
    } catch (err) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="hc-page">
      <Header variant="solid" />

      <main className="hc-auth-page">
        <div className="hc-auth-heading">
          <h1 className="hc-auth-title">마이페이지</h1>
          <p className="hc-auth-desc">내 정보와 알림 수신 설정을 확인할 수 있습니다.</p>
        </div>

        {loading && <p className="hc-mypage-status">불러오는 중...</p>}
        {error && <p className="hc-auth-error">{error}</p>}

        {me && (
          <>
            <section className="hc-auth-card hc-mypage-card">
              <h2 className="hc-mypage-section-title">내 정보</h2>
              <dl className="hc-mypage-info">
                <div className="hc-mypage-row">
                  <dt>이름</dt>
                  <dd>{me.name}</dd>
                </div>
                <div className="hc-mypage-row">
                  <dt>아이디</dt>
                  <dd>{me.loginId}</dd>
                </div>
                <div className="hc-mypage-row">
                  <dt>전화번호</dt>
                  <dd>{maskPhone(me.phoneNumber)}</dd>
                </div>
              </dl>
            </section>

            <section className="hc-auth-card hc-mypage-card">
              <h2 className="hc-mypage-section-title">알림 설정</h2>
              <div className="hc-mypage-toggle-row">
                <div>
                  <p className="hc-mypage-toggle-label">주보 알림 문자 수신</p>
                  <p className="hc-mypage-toggle-desc">
                    매주 주보를 가입하신 전화번호로 문자로 받아보실 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={me.smsReceive}
                  aria-label="주보 알림 문자 수신"
                  className={`hc-switch ${me.smsReceive ? "hc-switch--on" : ""}`}
                  onClick={handleToggleSms}
                  disabled={saving}
                >
                  <span className="hc-switch-thumb" />
                </button>
              </div>

              {me.smsReceiveUpdatedAt && (
                <p className="hc-mypage-updated">
                  마지막 변경: {formatDateTime(me.smsReceiveUpdatedAt)}
                </p>
              )}
              {message && <p className="hc-auth-hint hc-auth-hint--success">{message}</p>}
            </section>

            {!withdrawOpen ? (
              <button
                type="button"
                className="hc-mypage-withdraw-toggle"
                onClick={() => setWithdrawOpen(true)}
              >
                회원 탈퇴
              </button>
            ) : (
              <form className="hc-auth-card hc-mypage-card" onSubmit={handleWithdraw}>
                <h2 className="hc-mypage-section-title">회원 탈퇴</h2>
                <ul className="hc-mypage-withdraw-notice">
                  <li>탈퇴 시 이름, 생년월일, 전화번호, 아이디 등 회원 정보가 즉시 삭제되며 복구할 수 없습니다.</li>
                  <li>주보 알림 문자 발송도 중단됩니다.</li>
                  <li>
                    헌금 기록은 회원 정보와 별도로 보관됩니다. 자세한 내용은{" "}
                    <a href="/privacy" target="_blank" rel="noreferrer">개인정보처리방침</a>을 확인해주세요.
                  </li>
                </ul>

                <div className="hc-auth-field">
                  <label className="hc-auth-label" htmlFor="withdrawPassword">비밀번호 확인</label>
                  <input
                    id="withdrawPassword"
                    type="password"
                    className="hc-auth-input"
                    autoComplete="current-password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    disabled={withdrawing}
                  />
                </div>

                {withdrawError && <p className="hc-auth-error">{withdrawError}</p>}

                <div className="hc-mypage-withdraw-actions">
                  <button
                    type="button"
                    className="hc-mypage-withdraw-cancel"
                    onClick={() => {
                      setWithdrawOpen(false);
                      setWithdrawPassword("");
                      setWithdrawError("");
                    }}
                    disabled={withdrawing}
                  >
                    취소
                  </button>
                  <button type="submit" className="hc-mypage-withdraw-submit" disabled={withdrawing}>
                    {withdrawing ? "처리 중..." : "탈퇴하기"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
