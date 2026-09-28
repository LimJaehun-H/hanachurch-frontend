import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  API_BASE_URL,
  CHURCH_INFO,
  HEADER_LOGO_WHITE_IMAGE_URL,
  HEADER_LOGO_DARK_IMAGE_URL,
} from "../config.js";
import { getMemberLoginId, getMemberName, clearMemberSession, subscribeMemberAuthChange } from "../utils/memberAuth.js";

// variant: "overlay" (히어로 위, 스크롤에 따라 투명↔흰색 전환) | "solid" (내부 페이지, 항상 흰색)
export default function Header({ variant = "solid" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(variant !== "overlay");
  // 로그인/회원가입 상단바: 페이지 맨 위에서만 보이고 스크롤하면 숨김 (variant와 무관하게 공통 적용)
  const [topbarHidden, setTopbarHidden] = useState(false);
  // 로그인한 회원의 아이디 (로그인 안 했으면 null)
  const [memberLoginId, setMemberLoginId] = useState(() => getMemberLoginId());
  const [memberName, setMemberName] = useState(() => getMemberName());
  // 맨 위(투명 히어로 위, 스크롤 전) 상태용 흰색 로고
  const [logoWhiteUrl, setLogoWhiteUrl] = useState(HEADER_LOGO_WHITE_IMAGE_URL || null);
  // 스크롤 후 / 내부 페이지(흰 배경) 상태용 기본(컬러) 로고
  const [logoDarkUrl, setLogoDarkUrl] = useState(HEADER_LOGO_DARK_IMAGE_URL || null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-images/header_logo_white`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setLogoWhiteUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {
        // 실패하면 fallback 유지
      });

    fetch(`${API_BASE_URL}/api/site-images/header_logo_dark`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.length > 0) {
          setLogoDarkUrl(`${API_BASE_URL}/uploads/site-images/${encodeURIComponent(data[0].fileUrl)}`);
        }
      })
      .catch(() => {
        // 실패하면 fallback 유지
      });
  }, []);

  useEffect(() => {
    if (variant !== "overlay") {
      setScrolled(true);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // 상단바(로그인/회원가입)는 variant와 상관없이 페이지 맨 위에서만 노출
  // 단, 관리자 페이지에서는 표시하지 않음 (헤더 높이가 달라져 사이드바와 겹치는 문제 방지)
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleTopbarScroll = () => setTopbarHidden(window.scrollY > 10);
    handleTopbarScroll();
    window.addEventListener("scroll", handleTopbarScroll);
    return () => window.removeEventListener("scroll", handleTopbarScroll);
  }, []);

  // 로그인 상태 변화(로그인/로그아웃, 다른 탭에서의 변경) 구독
  useEffect(() => {
    const update = () => {
      setMemberLoginId(getMemberLoginId());
      setMemberName(getMemberName());
    };
    return subscribeMemberAuthChange(update);
  }, []);

  // 지금이 "투명 히어로 위, 스크롤 전" 상태인지 여부
  const isOverlayState = variant === "overlay" && !scrolled;
  // 해당 상태의 로고가 없으면 반대쪽 로고로라도 보여주고, 그것도 없으면 아래에서 텍스트로 대체
  const activeLogoUrl = isOverlayState
    ? logoWhiteUrl || logoDarkUrl
    : logoDarkUrl || logoWhiteUrl;

  const handleWordmarkClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      window.scrollTo(0, 0);
    }
  };

  const handleLogout = () => {
    clearMemberSession();
    navigate("/");
  };

  return (
    <header
      className={`hc-header hc-header--${variant} ${scrolled ? "hc-header--scrolled" : ""}`}
    >
      <div className={`hc-topbar ${(topbarHidden || isAdminPage) ? "hc-topbar--hidden" : ""}`}>
        <div className="hc-topbar-inner">
          {memberLoginId ? (
            <>
              <span className="hc-topbar-link hc-topbar-link--static">{(memberName || memberLoginId)}성도님</span>
              <button type="button" className="hc-topbar-link hc-topbar-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hc-topbar-link">
                로그인
              </Link>
              <Link to="/signup/agree" className="hc-topbar-link">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="hc-header-inner">
        <Link to="/" className="hc-wordmark" onClick={handleWordmarkClick}>
          {activeLogoUrl ? (
            <img
              src={activeLogoUrl}
              alt={CHURCH_INFO.name}
              className={`hc-wordmark-logo ${isOverlayState ? "hc-wordmark-logo--overlay" : ""}`}
            />
          ) : (
            CHURCH_INFO.name
          )}
        </Link>

        <nav className="hc-nav">
          <div className="hc-nav-item">
            <span className="hc-nav-parent">교회소개</span>
            <div className="hc-nav-dropdown">
              <Link to="/worship">예배안내</Link>
              <Link to="/location">오시는 길</Link>
              <Link to="/about">교회소개</Link>
            </div>
          </div>

          <div className="hc-nav-item">
            <span className="hc-nav-parent">예배와 말씀</span>
            <div className="hc-nav-dropdown">
              <Link to="/worship/sunday">주일예배</Link>
              <Link to="/worship/dawn">새벽예배</Link>
            </div>
          </div>

          <div className="hc-nav-item">
            <span className="hc-nav-parent">교회소식</span>
            <div className="hc-nav-dropdown">
              <Link to="/notice">교회공지</Link>
              <Link to="/bulletin">교회주보</Link>
              <Link to="/album">교회앨범</Link>
            </div>
          </div>

          <div className="hc-nav-item">
            <Link to="/offering" className="hc-nav-parent">
              온라인 헌금
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
