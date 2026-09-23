import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function OfferingFail() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "결제가 취소되었거나 실패했습니다.";

  return (
    <div className="hc-page">
      <Header variant="solid" />
      <main className="hc-offering-result-page">
        <div className="hc-offering-result-icon hc-offering-result-icon--error">✕</div>
        <h1 className="hc-offering-result-title">결제가 완료되지 않았습니다</h1>
        <p className="hc-offering-result-desc">{message}</p>
        <Link to="/offering" className="hc-offering-result-btn">
          다시 시도하기
        </Link>
      </main>
      <Footer />
    </div>
  );
}
