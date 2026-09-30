import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { API_BASE_URL } from "../config.js";

// 문자/알림톡의 [주보 보기] 링크로 들어오는 공개 페이지: /b/:id (또는 /b/latest)
// 카카오톡 인앱 브라우저에서 열리는 경우가 많아서 모바일 기준으로 사진을 크게 보여줌
function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

export default function BulletinSmsView() {
  const { id } = useParams();
  const [bulletin, setBulletin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setBulletin(null);
    setError("");
    fetch(`${API_BASE_URL}/api/bulletin-sms/${encodeURIComponent(id)}`)
      .then((res) => {
        if (res.status === 404) throw new Error("주보를 찾을 수 없습니다.");
        if (!res.ok) throw new Error("주보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        return res.json();
      })
      .then(setBulletin)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="hc-page">
      <Header variant="solid" />

      <main className="hc-bview">
        {!bulletin && !error && <p className="hc-bview-status">불러오는 중...</p>}
        {error && <p className="hc-bview-status">{error}</p>}

        {bulletin && (
          <>
            <div className="hc-bview-heading">
              <p className="hc-bview-eyebrow">하나교회 주보</p>
              <h1 className="hc-bview-title">{formatDate(bulletin.bulletinDate)}</h1>
              <p className="hc-bview-hint">사진을 누르면 원본 크기로 볼 수 있습니다.</p>
            </div>

            <div className="hc-bview-images">
              {bulletin.images.map((fileName, i) => {
                const src = `${API_BASE_URL}/uploads/bulletin-sms/${encodeURIComponent(fileName)}`;
                return (
                  <a key={fileName} href={src} target="_blank" rel="noreferrer" className="hc-bview-image">
                    <img src={src} alt={`주보 ${i + 1}페이지`} loading={i === 0 ? "eager" : "lazy"} />
                  </a>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
