import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";
import { setMemberSession } from "../utils/memberAuth.js";
import { KAKAO_SIGNUP_KEY } from "../utils/kakao.js";
import { AGREEMENT_ITEMS } from "./SignupAgree.jsx";

async function readErrorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

// 카카오로 처음 온 사람의 가입 화면 (/signup/kakao)
// 약관 동의 + 이름(카카오 이름 채워 둠) + 생년월일 + 전화번호
// 전화번호: 카카오가 줬으면 그대로(수정 불가), 안 줬으면 문자 인증
export default function KakaoSignup() {
  const navigate = useNavigate();
  const [kakao] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(KAKAO_SIGNUP_KEY) || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!kakao?.signupToken) navigate("/login", { replace: true });
  }, [kakao, navigate]);

  const [checked, setChecked] = useState(() => Object.fromEntries(AGREEMENT_ITEMS.map((i) => [i.key, false])));
  const [name, setName] = useState(kakao?.name || "");
  const [birthDate, setBirthDate] = useState("");

  const phoneFromKakao = kakao?.phoneNumber || "";
  const [phoneNumber, setPhoneNumber] = useState(phoneFromKakao);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(phoneFromKakao));
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneMessageType, setPhoneMessageType] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allChecked = AGREEMENT_ITEMS.every((i) => checked[i.key]);
  const requiredChecked = AGREEMENT_ITEMS.filter((i) => i.required).every((i) => checked[i.key]);
  const isBirthDateValid = /^[0-9]{8}$/.test(birthDate);
  const isPhoneFormatValid = /^01[0-9]{8,9}$/.test(phoneNumber);
  const canSubmit = requiredChecked && name.trim() && isBirthDateValid && phoneVerified && !submitting;

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
    setPhoneVerified(false);
    setPhoneSent(false);
    setPhoneCode("");
    setPhoneMessage("");
  };

  const handleSendCode = async () => {
    setPhoneSending(true);
    setPhoneMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/phone/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, "인증번호 발송에 실패했습니다."));
      setPhoneSent(true);
      setPhoneMessage("인증번호가 발송되었습니다.");
      setPhoneMessageType("success");
    } catch (err) {
      setPhoneMessage(err.message);
      setPhoneMessageType("error");
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setPhoneVerifying(true);
    setPhoneMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: phoneCode.trim() }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, "인증번호가 일치하지 않습니다."));
      setPhoneVerified(true);
      setPhoneMessage("전화번호 인증이 완료되었습니다.");
      setPhoneMessageType("success");
    } catch (err) {
      setPhoneMessage(err.message);
      setPhoneMessageType("error");
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/kakao/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signupToken: kakao.signupToken,
          agreeAge: checked.age,
          agreeTerms: checked.terms,
          agreePrivacy: checked.privacy,
          smsReceive: checked.smsReceive,
          name: name.trim(),
          birthDate,
          phoneNumber: phoneFromKakao ? "" : phoneNumber,
        }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, "가입에 실패했습니다."));
      const data = await res.json();
      sessionStorage.removeItem(KAKAO_SIGNUP_KEY);
      setMemberSession(data.token, data.loginId, data.name);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!kakao?.signupToken) return null;

  return (
    <div className="hc-page">
      <Header variant="solid" />
      <main className="hc-auth-page">
        <div className="hc-auth-heading">
          <h1 className="hc-auth-title">카카오로 가입하기</h1>
          <p className="hc-auth-desc">처음 오셨네요. 아래 내용을 확인하고 가입을 마쳐 주세요.</p>
        </div>

        <form className="hc-auth-card" onSubmit={handleSubmit}>
          <label className="hc-auth-agree-all">
            <input
              type="checkbox"
              className="hc-auth-checkbox"
              checked={allChecked}
              onChange={() => setChecked(Object.fromEntries(AGREEMENT_ITEMS.map((i) => [i.key, !allChecked])))}
            />
            <span>전체 동의합니다</span>
          </label>
          <div className="hc-auth-agree-list">
            {AGREEMENT_ITEMS.map((item) => (
              <div key={item.key} className="hc-auth-agree-item">
                <label className="hc-auth-agree-label">
                  <input
                    type="checkbox"
                    className="hc-auth-checkbox"
                    checked={checked[item.key]}
                    onChange={() => setChecked((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  />
                  <span>{item.label}</span>
                </label>
                {item.link && (
                  <a href={item.link.to} target="_blank" rel="noreferrer" className="hc-auth-agree-link">
                    {item.link.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="kname">이름</label>
            <input id="kname" className="hc-auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" />
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="kbirth">생년월일</label>
            <input
              id="kbirth"
              className="hc-auth-input"
              inputMode="numeric"
              maxLength={8}
              placeholder="YYYYMMDD (예: 19990101)"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="kphone">전화번호</label>
            {phoneFromKakao ? (
              <>
                <input id="kphone" className="hc-auth-input" value={phoneFromKakao} disabled />
                <p className="hc-auth-hint hc-auth-hint--success">카카오에서 확인된 번호입니다.</p>
              </>
            ) : (
              <>
                <div className="hc-auth-input-row">
                  <input
                    id="kphone"
                    className="hc-auth-input"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="- 없이 숫자만 입력"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={phoneVerified}
                  />
                  <button
                    type="button"
                    className="hc-auth-btn-inline"
                    onClick={handleSendCode}
                    disabled={phoneSending || phoneVerified || !isPhoneFormatValid}
                  >
                    {phoneVerified ? "인증완료" : phoneSending ? "발송중..." : phoneSent ? "재전송" : "인증번호 받기"}
                  </button>
                </div>
                {phoneSent && !phoneVerified && (
                  <div className="hc-auth-input-row" style={{ marginTop: 10 }}>
                    <input
                      className="hc-auth-input"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="인증번호 6자리"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                    <button type="button" className="hc-auth-btn-inline" onClick={handleVerifyCode} disabled={phoneVerifying || !phoneCode}>
                      {phoneVerifying ? "확인중..." : "확인"}
                    </button>
                  </div>
                )}
                {phoneMessage && <p className={`hc-auth-hint hc-auth-hint--${phoneMessageType}`}>{phoneMessage}</p>}
              </>
            )}
          </div>

          {error && <p className="hc-auth-error">{error}</p>}
          <button type="submit" className="hc-auth-submit" disabled={!canSubmit}>
            {submitting ? "가입 중..." : "가입하기"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
