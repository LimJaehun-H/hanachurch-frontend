import React, { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, TOSS_CLIENT_KEY, OFFERING_HERO_IMAGE_URL } from "../config.js";

const AMOUNT_OPTIONS = [1000, 3000, 5000, 10000];

export default function Offering() {
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = isCustom ? Number(customAmount.replace(/[^0-9]/g, "")) : selectedAmount;

  const handleSelectAmount = (amount) => {
    setIsCustom(false);
    setSelectedAmount(amount);
    setError("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setError("");
  };

  const handleCustomChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(digitsOnly);
  };

  const handleSubmit = async () => {
    setError("");

    if (!finalAmount || finalAmount < 1000) {
      setError("최소 1,000원 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offerings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, donorName: donorName.trim() || null }),
      });

      if (!res.ok) throw new Error("주문 생성 실패");
      const data = await res.json();

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      await tossPayments.requestPayment("카드", {
        amount: finalAmount,
        orderId: data.orderId,
        orderName: "온라인 헌금",
        customerName: donorName.trim() || "익명",
        successUrl: `${window.location.origin}/offering/success`,
        failUrl: `${window.location.origin}/offering/fail`,
      });
    } catch (err) {
      console.error(err);
      setError("결제 요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="offering_hero" fallbackImageUrl={OFFERING_HERO_IMAGE_URL} />

      <main className="hc-offering-page">
        <div className="hc-offering-heading">
          <h1 className="hc-offering-title">온라인 헌금</h1>
          <div className="hc-offering-divider">
            <span className="hc-offering-divider-line" />
            <span className="hc-offering-divider-label">Offering</span>
            <span className="hc-offering-divider-line" />
          </div>
          <p className="hc-offering-desc">
            정성을 담아 드리는 헌금이 하나님께 온전히 드려지길 바랍니다.
          </p>
        </div>

        <div className="hc-offering-card">
          <div className="hc-offering-field">
            <label className="hc-offering-label">헌금 금액</label>
            <div className="hc-offering-amounts">
              {AMOUNT_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`hc-offering-amount-btn ${
                    !isCustom && selectedAmount === amount ? "hc-offering-amount-btn--active" : ""
                  }`}
                  onClick={() => handleSelectAmount(amount)}
                >
                  {amount.toLocaleString()}원
                </button>
              ))}
              <button
                type="button"
                className={`hc-offering-amount-btn ${isCustom ? "hc-offering-amount-btn--active" : ""}`}
                onClick={handleCustomClick}
              >
                기타
              </button>
            </div>

            {isCustom && (
              <input
                type="text"
                inputMode="numeric"
                className="hc-offering-input"
                placeholder="원하는 금액을 입력하세요"
                value={customAmount}
                onChange={handleCustomChange}
                autoFocus
              />
            )}
          </div>

          <div className="hc-offering-field">
            <label className="hc-offering-label" htmlFor="donorName">
              이름 <span className="hc-offering-optional">(선택)</span>
            </label>
            <input
              id="donorName"
              type="text"
              className="hc-offering-input"
              placeholder="헌금자 이름을 입력하세요"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className="hc-offering-total">
            <span>결제 금액</span>
            <strong>{(finalAmount || 0).toLocaleString()}원</strong>
          </div>

          {error && <p className="hc-offering-error">{error}</p>}

          <button
            type="button"
            className="hc-offering-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "결제창 여는 중..." : "헌금하기"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
