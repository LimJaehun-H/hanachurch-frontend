import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";

async function readErrorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function Signup() {
  const navigate = useNavigate();

  // 동의 페이지를 거치지 않고 직접 들어오면 다시 동의 페이지로 보냄
  useEffect(() => {
    if (sessionStorage.getItem("hc_signup_agreed") !== "true") {
      navigate("/signup/agree", { replace: true });
    }
  }, [navigate]);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneMessageType, setPhoneMessageType] = useState(""); // "success" | "error"

  const [loginId, setLoginId] = useState("");
  const [idChecking, setIdChecking] = useState(false);
  const [idAvailable, setIdAvailable] = useState(null); // null | true | false
  const [idCheckedValue, setIdCheckedValue] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isBirthDateValid = /^[0-9]{8}$/.test(birthDate);
  const isPhoneFormatValid = /^01[0-9]{8,9}$/.test(phoneNumber);
  const isIdValid = loginId.length >= 4 && loginId.length <= 20;
  const isIdConfirmed = idAvailable === true && idCheckedValue === loginId;
  const isPasswordValid = password.length >= 8;
  const isPasswordMatched = password.length > 0 && password === passwordConfirm;

  const canSubmit =
    name.trim().length > 0 &&
    isBirthDateValid &&
    phoneVerified &&
    isIdConfirmed &&
    isPasswordValid &&
    isPasswordMatched &&
    !submitting;

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
    setPhoneVerified(false);
    setPhoneSent(false);
    setPhoneCode("");
    setPhoneMessage("");
  };

  const handleSendCode = async () => {
    if (!isPhoneFormatValid) {
      setPhoneMessage("올바른 휴대폰 번호를 입력해주세요.");
      setPhoneMessageType("error");
      return;
    }
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
    if (!phoneCode.trim()) return;
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
      setPhoneVerified(false);
      setPhoneMessage(err.message);
      setPhoneMessageType("error");
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleLoginIdChange = (e) => {
    setLoginId(e.target.value.replace(/\s/g, ""));
    setIdAvailable(null);
  };

  const handleCheckId = async () => {
    if (!isIdValid) return;
    setIdChecking(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/members/check-id?loginId=${encodeURIComponent(loginId)}`
      );
      if (!res.ok) throw new Error("중복확인 중 오류가 발생했습니다.");
      const data = await res.json();
      setIdAvailable(data.available);
      setIdCheckedValue(loginId);
    } catch (err) {
      setIdAvailable(false);
      setIdCheckedValue(loginId);
    } finally {
      setIdChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/members/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          phoneNumber,
          loginId,
          password,
          passwordConfirm,
          // 약관 페이지에서 선택한 주보 문자 수신 동의 여부
          smsReceive: sessionStorage.getItem("hc_signup_sms_receive") === "true",
        }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, "회원가입에 실패했습니다."));

      sessionStorage.removeItem("hc_signup_agreed");
      sessionStorage.removeItem("hc_signup_sms_receive");
      alert("회원가입이 완료되었습니다.");
      navigate("/");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hc-page">
      <Header variant="solid" />

      <main className="hc-auth-page">
        <div className="hc-auth-heading">
          <h1 className="hc-auth-title">회원 정보 입력</h1>
          <p className="hc-auth-desc">가입에 필요한 정보를 입력해주세요.</p>
        </div>

        <div className="hc-auth-card">
          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="name">이름</label>
            <input
              id="name"
              type="text"
              className="hc-auth-input"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="birthDate">생년월일</label>
            <input
              id="birthDate"
              type="text"
              inputMode="numeric"
              className="hc-auth-input"
              placeholder="YYYYMMDD (예: 19990101)"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={8}
            />
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="phoneNumber">전화번호</label>
            <div className="hc-auth-input-row">
              <input
                id="phoneNumber"
                type="text"
                inputMode="numeric"
                className="hc-auth-input"
                placeholder="- 없이 숫자만 입력"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={11}
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
                  type="text"
                  inputMode="numeric"
                  className="hc-auth-input"
                  placeholder="인증번호 6자리"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={6}
                />
                <button
                  type="button"
                  className="hc-auth-btn-inline"
                  onClick={handleVerifyCode}
                  disabled={phoneVerifying || !phoneCode.trim()}
                >
                  {phoneVerifying ? "확인중..." : "확인"}
                </button>
              </div>
            )}

            {phoneMessage && (
              <p className={`hc-auth-hint hc-auth-hint--${phoneMessageType}`}>{phoneMessage}</p>
            )}
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="loginId">아이디</label>
            <div className="hc-auth-input-row">
              <input
                id="loginId"
                type="text"
                className="hc-auth-input"
                placeholder="4~20자"
                value={loginId}
                onChange={handleLoginIdChange}
                maxLength={20}
              />
              <button
                type="button"
                className="hc-auth-btn-inline"
                onClick={handleCheckId}
                disabled={idChecking || !isIdValid}
              >
                {idChecking ? "확인중..." : "중복확인"}
              </button>
            </div>
            {idAvailable !== null && idCheckedValue === loginId && (
              <p className={`hc-auth-hint hc-auth-hint--${idAvailable ? "success" : "error"}`}>
                {idAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다."}
              </p>
            )}
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              className="hc-auth-input"
              placeholder="8~30자"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className="hc-auth-field">
            <label className="hc-auth-label" htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              type="password"
              className="hc-auth-input"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              maxLength={30}
            />
            {passwordConfirm.length > 0 && (
              <p className={`hc-auth-hint hc-auth-hint--${isPasswordMatched ? "success" : "error"}`}>
                {isPasswordMatched ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          {submitError && <p className="hc-auth-error">{submitError}</p>}

          <button
            type="button"
            className="hc-auth-submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? "가입 처리 중..." : "가입하기"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
