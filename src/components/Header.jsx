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
  // 모바일 햄버거 메뉴 열림 여부
  const [menuOpen, setMenuOpen] = useState(false);
  // 모바일 메뉴에서 펼쳐진 상위 메뉴(아코디언) 인덱스, 없으면 null
  const [openIdx, setOpenIdx] = useState(null);
  const toggleSection = (i) => setOpenIdx((prev) => (prev === i ? null : i));
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

  // 페이지 이동(메뉴의 링크 클릭 등) 시 모바일 메뉴 자동 닫기
  useEffect(() => {
    setMenuOpen(false);
    setOpenIdx(null);
  }, [location.pathname]);

  // 모바일 메뉴 열려 있을 때 뒤 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
    setMenuOpen(false); // 홈에서 로그아웃하면 경로가 그대로라 드로어가 자동으로 닫히지 않음
    navigate("/");
  };

  // 로그인/회원가입 (로그인 후엔 이름/로그아웃): 데스크톱 상단바와 모바일 드로어 공용
  const renderAuthLinks = (linkClass, logoutClass = linkClass) =>
    memberLoginId ? (
      <>
        <Link to="/mypage" className={linkClass}>{(memberName || memberLoginId)}성도님</Link>
        <button type="button" className={logoutClass} onClick={handleLogout}>
          로그아웃
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className={linkClass}>
          로그인
        </Link>
        <Link to="/signup/agree" className={linkClass}>
          회원가입
        </Link>
      </>
    );

  return (
    <header
      className={`hc-header hc-header--${variant} ${scrolled ? "hc-header--scrolled" : ""} ${menuOpen ? "hc-header--menu-open" : ""}`}
    >
      <div className={`hc-topbar ${(topbarHidden || isAdminPage) ? "hc-topbar--hidden" : ""}`}>
        <div className="hc-topbar-inner">
          {renderAuthLinks("hc-topbar-link", "hc-topbar-link hc-topbar-btn")}
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

        <button
          type="button"
          className={`hc-nav-toggle ${menuOpen ? "hc-nav-toggle--open" : ""}`}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`hc-nav ${menuOpen ? "hc-nav--open" : ""}`}>
          {/* 모바일 드로어 상단 띠 (데스크톱에선 숨김) */}
          <div className="hc-nav-auth">{renderAuthLinks("hc-nav-auth-link")}</div>

          <div className={`hc-nav-item ${openIdx === 0 ? "hc-nav-item--open" : ""}`}>
            <button type="button" className="hc-nav-parent" onClick={() => toggleSection(0)}>
              교회소개<span className="hc-nav-caret" aria-hidden="true" />
            </button>
            <div className="hc-nav-dropdown">
              <Link to="/worship">예배안내</Link>
              <Link to="/location">오시는 길</Link>
              <Link to="/about">교회소개</Link>
            </div>
          </div>

          <div className={`hc-nav-item ${openIdx === 1 ? "hc-nav-item--open" : ""}`}>
            <button type="button" className="hc-nav-parent" onClick={() => toggleSection(1)}>
              예배와 말씀<span className="hc-nav-caret" aria-hidden="true" />
            </button>
            <div className="hc-nav-dropdown">
              <Link to="/worship/sunday">주일예배</Link>
              <Link to="/worship/dawn">새벽예배</Link>
            </div>
          </div>

          <div className={`hc-nav-item ${openIdx === 2 ? "hc-nav-item--open" : ""}`}>
            <button type="button" className="hc-nav-parent" onClick={() => toggleSection(2)}>
              교회소식<span className="hc-nav-caret" aria-hidden="true" />
            </button>
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

      {/* 모바일 메뉴 뒤 어두운 배경 (탭하면 닫힘) */}
      <div
        className={`hc-nav-backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </header>
  );
}
