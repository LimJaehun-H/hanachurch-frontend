import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HOME_POPUP } from "../config.js";

// 홈 화면 안내 팝업 (설정은 config.js의 HOME_POPUP)
const STORAGE_KEY = `hc_popup_hide_until_${HOME_POPUP.id}`;

// 시크릿 모드 등에서 저장소가 막혀 있으면 오류 없이 넘어감 (그 경우 매번 팝업이 뜸)
function readHideUntil() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY) || 0);
  } catch {
    return 0;
  }
}

function saveHideUntil(ms) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms));
  } catch {
    // 저장 실패는 무시
  }
}

export default function HomePopup() {
  const [open, setOpen] = useState(
    () => HOME_POPUP.enabled && Date.now() >= readHideUntil()
  );
  const [dontShow, setDontShow] = useState(false);

  const close = () => {
    if (dontShow) {
      saveHideUntil(Date.now() + HOME_POPUP.hideDays * 24 * 60 * 60 * 1000);
    }
    setOpen(false);
  };

  // 팝업이 떠 있는 동안 뒤 화면 스크롤 막기, ESC로 닫기
  useEffect(() => {
    if (!open) return;
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
  }, [open, dontShow]);

  if (!open) return null;

  const { title, message, buttonText, link, contactLabel, contactPhone } = HOME_POPUP;
  const isExternal = /^https?:\/\//.test(link || "");

  return (
    <div className="hc-popup-backdrop" onClick={close}>
      <div
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
        <p className="hc-popup-message">{message}</p>

        {contactPhone && (
          <p className="hc-popup-contact">
            {contactLabel}{" "}
            <a href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}>{contactPhone}</a>
          </p>
        )}

        {link &&
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
            {HOME_POPUP.hideDays === 7 ? "일주일간" : `${HOME_POPUP.hideDays}일간`} 보지 않기
          </label>
          <button type="button" className="hc-popup-close" onClick={close}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
