import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import SubHero from "../components/SubHero.jsx";
import { API_BASE_URL, NOTICE_HERO_IMAGE_URL, CHURCH_INFO } from "../config.js";

export default function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setNotice(null);
    setError(false);
    fetch(`${API_BASE_URL}/api/notices/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setNotice)
      .catch(() => setError(true));
  }, [id]);

  // content 안의 <img src="/uploads/...">(상대경로)에만 도메인을 붙임
  // 이미 http로 시작하는(예전에 저장된) 것은 그대로 둠 → 신/구 데이터 둘 다 정상 표시
  const resolveContentUrls = (html) => {
    if (!html) return html;
    return html.replace(
      /(<img[^>]+src=["'])(\/uploads\/[^"']+)(["'])/gi,
      (match, prefix, path, suffix) => `${prefix}${API_BASE_URL}${path}${suffix}`
    );
  };

  // 관리자 계정이 뚫렸을 때를 대비한 이중 방어: 스크립트/이벤트 핸들러 등 위험한 요소를 걸러내고
  // 이미지, 줄바꿈 같은 정상적인 서식은 그대로 살려둠
  const renderContent = (html) => DOMPurify.sanitize(resolveContentUrls(html));

  return (
    <div className="hc-page">
      <Header variant="overlay" />
      <SubHero groupKey="notice_hero" fallbackImageUrl={NOTICE_HERO_IMAGE_URL} />

      <main className="hc-inner-content">
        <Link to="/notice" className="hc-album-detail-back">← 목록으로</Link>

        <p className="hc-bulletin-heading-eyebrow">{CHURCH_INFO.name}</p>
        <div className="hc-bulletin-heading-row">
          <h1 className="hc-bulletin-heading-title">교회소식</h1>
          <span className="hc-bulletin-heading-line" />
        </div>

        {error && <div className="hc-empty">공지사항을 찾을 수 없습니다.</div>}
        {!error && notice === null && <p className="hc-loading">불러오는 중…</p>}

        {notice && (
          <>
            <h2 className="hc-bulletin-detail-title">{notice.title}</h2>
            <p className="hc-bulletin-detail-date">{formatDate(notice.createdAt)}</p>

            <div
              className="hc-notice-detail-content"
              dangerouslySetInnerHTML={{ __html: renderContent(notice.content) }}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}