import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("confirming"); // confirming | success | error
  const [message, setMessage] = useState("");

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setMessage("결제 정보를 확인할 수 없습니다.");
      return;
    }

    fetch(`${API_BASE_URL}/api/donations/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("승인 실패");
        return res.json();
      })
      .then(() => {
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
        setMessage("결제 승인 처리 중 문제가 발생했습니다. 교회로 문의해주세요.");
      });
  }, [paymentKey, orderId, amount]);

  return (
    <div className="hc-page">
      <Header variant="solid" />
      <main className="hc-donation-result-page">
        {status === "confirming" && (
          <>
            <div className="hc-donation-result-icon hc-donation-result-icon--pending">⏳</div>
            <h1 className="hc-donation-result-title">결제를 확인하고 있습니다</h1>
            <p className="hc-donation-result-desc">잠시만 기다려주세요.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="hc-donation-result-icon hc-donation-result-icon--success">✓</div>
            <h1 className="hc-donation-result-title">헌금이 완료되었습니다</h1>
            <p className="hc-donation-result-desc">
              {amount ? `${Number(amount).toLocaleString()}원이 정상적으로 헌금되었습니다.` : ""}
              <br />
              귀한 헌금 감사드립니다.
            </p>
            <Link to="/" className="hc-donation-result-btn">
              홈으로 돌아가기
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="hc-donation-result-icon hc-donation-result-icon--error">✕</div>
            <h1 className="hc-donation-result-title">결제 승인에 실패했습니다</h1>
            <p className="hc-donation-result-desc">{message}</p>
            <Link to="/donation" className="hc-donation-result-btn">
              다시 시도하기
            </Link>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
