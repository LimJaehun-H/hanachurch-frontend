import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const AGREEMENT_ITEMS = [
  {
    key: "age",
    required: true,
    label: "만 14세 이상입니다.",
  },
  {
    key: "terms",
    required: true,
    label: "이용약관 동의 (필수)",
    detail:
      "본 사이트가 제공하는 회원 서비스 이용을 위해 이용약관에 동의해주세요. (약관 전문은 추후 게시됩니다)",
  },
  {
    key: "privacy",
    required: true,
    label: "개인정보 수집 및 이용 동의 (필수)",
    detail:
      "회원가입 및 본인확인을 위해 이름, 생년월일, 전화번호, 아이디를 수집하며, 탈퇴 시 즉시 파기됩니다.",
    link: { to: "/privacy", label: "개인정보처리방침 전문 보기" },
  },
  {
    key: "smsReceive",
    required: false,
    label: "주보 알림 문자 수신 동의 (선택)",
    detail:
      "매주 주보를 문자로 받아보실 수 있습니다. 동의하지 않아도 가입할 수 있으며, 마이페이지에서 언제든 변경할 수 있습니다.",
  },
];

export default function SignupAgree() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, false]))
  );

  // 전체 동의 체크박스 상태: 선택 항목까지 모두 체크됐는지
  const allChecked = AGREEMENT_ITEMS.every((item) => checked[item.key]);
  // 다음 버튼 활성화 조건: 필수 항목만 체크되면 됨
  const requiredChecked = AGREEMENT_ITEMS.filter((item) => item.required).every(
    (item) => checked[item.key]
  );

  const handleToggleAll = () => {
    const next = !allChecked;
    setChecked(Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, next])));
  };

  const handleToggleOne = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (!requiredChecked) return;
    sessionStorage.setItem("hc_signup_agreed", "true");
    // 선택 동의 값을 가입 폼(Signup.jsx)으로 전달
    sessionStorage.setItem("hc_signup_sms_receive", String(checked.smsReceive));
    navigate("/signup");
  };

  return (
    <div className="hc-page">
      <Header variant="solid" />

      <main className="hc-auth-page">
        <div className="hc-auth-heading">
          <h1 className="hc-auth-title">회원가입</h1>
          <p className="hc-auth-desc">서비스 이용을 위해 아래 약관에 동의해주세요.</p>
        </div>

        <div className="hc-auth-card">
          <label className="hc-auth-agree-all">
            <input
              type="checkbox"
              className="hc-auth-checkbox"
              checked={allChecked}
              onChange={handleToggleAll}
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
                    onChange={() => handleToggleOne(item.key)}
                  />
                  <span>{item.label}</span>
                </label>
                {item.detail && <p className="hc-auth-agree-detail">{item.detail}</p>}
                {item.link && (
                  <a
                    href={item.link.to}
                    target="_blank"
                    rel="noreferrer"
                    className="hc-auth-agree-link"
                  >
                    {item.link.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="hc-auth-submit"
            disabled={!requiredChecked}
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
