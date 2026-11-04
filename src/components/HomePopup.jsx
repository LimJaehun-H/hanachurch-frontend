import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";

// 홈 화면 안내 팝업
// 관리자 화면(홈 팝업 관리)에서 등록한 팝업 중 지금 띄울 것을 받아와 차례로 보여준다.
// "일주일간 보지 않기"는 팝업마다 따로 기억하고, 관리자가 내용을 수정하면(updatedAt 변경) 다시 보인다.
const HIDE_DAYS = 7;

function storageKey(popup) {
  return `hc_popup_hide_until_${popup.id}_${popup.updatedAt}`;
}

// 시크릿 모드 등에서 저장소가 막혀 있으면 오류 없이 넘어감 (그 경우 매번 팝업이 뜸)
function isHidden(popup) {
  try {
    return Date.now() < Number(localStorage.getItem(storageKey(popup)) || 0);
  } catch {
    return false;
  }
}

function hideForDays(popup) {
  try {
    localStorage.setItem(storageKey(popup), String(Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000));
  } catch {
    // 저장 실패는 무시
  }
}

export default function HomePopup() {
  const [queue, setQueue] = useState([]);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/home-popups`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setQueue(list.filter((p) => !isHidden(p)));
      })
      .catch(() => {}); // 팝업을 못 불러와도 홈 화면은 그대로
    return () => {
      cancelled = true;
    };
  }, []);

  const popup = queue[0];

  // 지금 보이는 팝업을 닫고 다음 팝업으로
  const close = () => {
    if (!popup) return;
    if (dontShow) hideForDays(popup);
    setDontShow(false);
    setQueue((q) => q.slice(1));
  };

  // 팝업이 떠 있는 동안 뒤 화면 스크롤 막기, ESC로 닫기
  useEffect(() => {
    if (!popup) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup, dontShow]);

  if (!popup) return null;

  const { title, message, buttonText, link } = popup;
  const isExternal = /^https:\/\//.test(link || "");
  // 역슬래시가 든 주소("/\\다른사이트")는 브라우저가 외부 주소로 해석할 수 있어 버튼을 숨김
  const showButton = Boolean(link && buttonText && !link.includes("\\"));

  return (
    <div className="hc-popup-backdrop" onClick={close}>
      <div
        key={popup.id}
        className="hc-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hc-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="hc-popup-x" onClick={close} aria-label="닫기">
          ×
        </button>

        <h2 id="hc-popup-title" className="hc-popup-title">{title}</h2>
        {message && <p className="hc-popup-message">{message}</p>}

        {showButton &&
          (isExternal ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="hc-popup-action" onClick={close}>
              {buttonText}
            </a>
          ) : (
            <Link to={link} className="hc-popup-action" onClick={close}>
              {buttonText}
            </Link>
          ))}

        <div className="hc-popup-footer">
          <label className="hc-popup-check">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            일주일간 보지 않기
          </label>
          <button type="button" className="hc-popup-close" onClick={close}>
            {queue.length > 1 ? "다음" : "닫기"}
          </button>
        </div>
      </div>
    </div>
  );
}
