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
  },
];

export default function SignupAgree() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, false]))
  );

  const allChecked = AGREEMENT_ITEMS.every((item) => checked[item.key]);

  const handleToggleAll = () => {
    const next = !allChecked;
    setChecked(Object.fromEntries(AGREEMENT_ITEMS.map((item) => [item.key, next])));
  };

  const handleToggleOne = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (!allChecked) return;
    sessionStorage.setItem("hc_signup_agreed", "true");
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
              </div>
            ))}
          </div>

          <button
            type="button"
            className="hc-auth-submit"
            disabled={!allChecked}
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
