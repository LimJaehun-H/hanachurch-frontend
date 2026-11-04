import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import AdminNoticePanel from "../components/AdminNoticePanel.jsx";
import AdminBulletinPanel from "../components/AdminBulletinPanel.jsx";
import AdminAlbumPanel from "../components/AdminAlbumPanel.jsx";
import AdminSermonPanel from "../components/AdminSermonPanel.jsx";
import AdminHomeVideoPanel from "../components/AdminHomeVideoPanel.jsx";
import AdminSiteImagePanel from "../components/AdminSiteImagePanel.jsx";
import AdminPasswordPanel from "../components/AdminPasswordPanel.jsx";
import AdminBulletinSmsPanel from "../components/AdminBulletinSmsPanel.jsx";
import AdminHomePopupPanel from "../components/AdminHomePopupPanel.jsx";
import { API_BASE_URL } from "../config.js";
import "../admin.css";

// 메뉴 구조: 구역 > (펼치는 묶음 > 메뉴) 또는 바로가는 메뉴
const MENU = [
  {
    section: "운영",
    entries: [
      {
        group: "board",
        label: "게시판",
        items: [
          { key: "notice", label: "교회소식 관리", desc: "교회소식(공지사항)을 쓰고, 고치고, 지울 수 있습니다." },
          { key: "bulletin", label: "주보 관리", desc: "주보 파일(PDF 또는 사진)을 올립니다. PDF는 쪽마다 사진으로 바뀌어 휴대폰에서도 바로 보입니다." },
          { key: "sermon", label: "말씀 관리", desc: "주일예배와 새벽예배 말씀 녹음 파일을 올립니다." },
          { key: "album", label: "앨범 관리", desc: "행사 사진을 앨범으로 묶어 올립니다." },
        ],
      },
      { key: "bulletinsms", label: "주보 문자 발송", desc: "주보 사진을 문자 수신에 동의한 성도님께 문자(MMS)로 보냅니다." },
    ],
  },
  {
    section: "홈페이지 꾸미기",
    entries: [
      {
        group: "home",
        label: "홈 화면",
        items: [
          { key: "homevideo", label: "홈화면 영상 관리", desc: "홈 화면 맨 위에 재생되는 배경 영상을 바꿉니다." },
          { key: "homepopup", label: "홈화면 팝업 관리", desc: "홈 화면에 뜨는 안내 팝업을 기간과 순서를 정해 띄웁니다." },
        ],
      },
      { key: "siteimage", label: "사이트 이미지 관리", desc: "각 페이지에 쓰이는 사진을 바꾸거나 추가합니다." },
    ],
  },
  {
    section: "계정",
    entries: [{ key: "password", label: "비밀번호 변경", desc: "관리자 로그인 비밀번호를 바꿉니다." }],
  },
];

// key → { item, groupKey, groupLabel, section }
const MENU_INDEX = {};
MENU.forEach(({ section, entries }) =>
  entries.forEach((entry) => {
    if (entry.items) {
      entry.items.forEach((item) => {
        MENU_INDEX[item.key] = { item, groupKey: entry.group, groupLabel: entry.label, section };
      });
    } else {
      MENU_INDEX[entry.key] = { item: entry, groupKey: null, groupLabel: null, section };
    }
  })
);

const PANELS = {
  password: AdminPasswordPanel,
  notice: AdminNoticePanel,
  bulletin: AdminBulletinPanel,
  bulletinsms: AdminBulletinSmsPanel,
  album: AdminAlbumPanel,
  sermon: AdminSermonPanel,
  homevideo: AdminHomeVideoPanel,
  homepopup: AdminHomePopupPanel,
  siteimage: AdminSiteImagePanel,
};

function Caret() {
  return <span className="hc-adm-caret" aria-hidden="true" />;
}

// PC 왼쪽 메뉴와 폰 펼침 메뉴가 같이 쓰는 메뉴 트리
function AdminMenu({ activeTab, openGroups, onToggleGroup, onSelect }) {
  return (
    <nav className="hc-adm-menu" aria-label="관리자 메뉴">
      {MENU.map(({ section, entries }) => (
        <div key={section} className="hc-adm-menu-section">
          <p className="hc-adm-menu-section-label">{section}</p>
          {entries.map((entry) => {
            if (!entry.items) {
              return (
                <button
                  key={entry.key}
                  type="button"
                  className={`hc-adm-menu-top ${activeTab === entry.key ? "hc-adm-menu-top--active" : ""}`}
                  aria-current={activeTab === entry.key ? "page" : undefined}
                  onClick={() => onSelect(entry.key)}
                >
                  {entry.label}
                </button>
              );
            }
            const open = openGroups.has(entry.group);
            return (
              <div key={entry.group} className={`hc-adm-menu-group ${open ? "hc-adm-menu-group--open" : ""}`}>
                <button
                  type="button"
                  className="hc-adm-menu-top"
                  aria-expanded={open}
                  onClick={() => onToggleGroup(entry.group)}
                >
                  {entry.label}
                  <Caret />
                </button>
                <div className="hc-adm-menu-sub">
                  {entry.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      tabIndex={open ? 0 : -1}
                      className={`hc-adm-menu-item ${activeTab === item.key ? "hc-adm-menu-item--active" : ""}`}
                      aria-current={activeTab === item.key ? "page" : undefined}
                      onClick={() => onSelect(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function Admin() {
  // 토큰은 이 컴포넌트의 메모리에만 존재합니다.
  // 페이지를 벗어났다가(다른 메뉴 클릭 등) 다시 "관리자"로 들어오면 항상 초기화되어 로그인부터 다시 해야 합니다.
  const [token, setToken] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [activeTab, setActiveTab] = useState("notice");
  const [openGroups, setOpenGroups] = useState(() => new Set(["board", "home"]));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 폰 메뉴가 열려 있을 때는 뒤 화면이 스크롤되지 않게
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleAuthExpired = () => {
    setToken(null);
    setLoginError("세션이 만료되었습니다. 다시 로그인해주세요.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message);
        return;
      }
      setToken(data.token);
    } catch {
      setLoginError("서버에 연결할 수 없습니다.");
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setToken(null);
  };

  const toggleGroup = (group) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const selectTab = (key) => {
    setActiveTab(key);
    setMobileMenuOpen(false);
    const groupKey = MENU_INDEX[key]?.groupKey;
    if (groupKey) setOpenGroups((prev) => new Set(prev).add(groupKey));
    window.scrollTo({ top: 0 });
  };

  const current = MENU_INDEX[activeTab];
  const Panel = PANELS[activeTab];
  const panelProps = { token, onAuthExpired: handleAuthExpired };

  if (!token) {
    return (
      <div className="hc-page hc-adm">
        <Header variant="solid" />
        <main className="hc-adm-login-page">
          <div className="hc-adm-login-card">
            <p className="hc-adm-login-eyebrow">ADMIN</p>
            <h1 className="hc-adm-login-title">관리자 로그인</h1>
            <form className="hc-adm-login-form" onSubmit={handleLogin}>
              <label className="hc-adm-label">
                아이디
                <input
                  className="hc-adm-input"
                  type="text"
                  autoComplete="username"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </label>
              <label className="hc-adm-label">
                비밀번호
                <input
                  className="hc-adm-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button type="submit" className="hc-adm-btn hc-adm-btn--primary hc-adm-btn--block">로그인</button>
              {loginError && <p className="hc-adm-status hc-adm-status--err">{loginError}</p>}
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hc-page hc-adm">
      <Header variant="solid" />

      {/* 상단 경로 줄 (폰에서는 누르면 메뉴가 펼쳐짐) */}
      <div className="hc-adm-topbar">
        <div className="hc-adm-topbar-inner">
          <ol className="hc-adm-breadcrumb">
            <li>관리자</li>
            <li>{current.section}</li>
            {current.groupLabel && <li>{current.groupLabel}</li>}
            <li aria-current="page">{current.item.label}</li>
          </ol>
          <button
            type="button"
            className={`hc-adm-mobile-toggle ${mobileMenuOpen ? "hc-adm-mobile-toggle--open" : ""}`}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="hc-adm-mobile-toggle-label">메뉴</span>
            <span className="hc-adm-mobile-toggle-current">{current.item.label}</span>
            <Caret />
          </button>
          <button type="button" className="hc-adm-logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {/* 폰 전용 펼침 메뉴 */}
        <div className={`hc-adm-mobile-menu ${mobileMenuOpen ? "hc-adm-mobile-menu--open" : ""}`}>
          <AdminMenu
            activeTab={activeTab}
            openGroups={openGroups}
            onToggleGroup={toggleGroup}
            onSelect={selectTab}
          />
        </div>
      </div>
      {mobileMenuOpen && <div className="hc-adm-mobile-dim" onClick={() => setMobileMenuOpen(false)} />}

      <div className="hc-adm-shell">
        <aside className="hc-adm-sidebar">
          <AdminMenu
            activeTab={activeTab}
            openGroups={openGroups}
            onToggleGroup={toggleGroup}
            onSelect={selectTab}
          />
        </aside>

        <main className="hc-adm-content">
          <header className="hc-adm-page-head">
            <h2 className="hc-adm-page-title">{current.item.label}</h2>
            <p className="hc-adm-page-desc">{current.item.desc}</p>
          </header>
          <div className="hc-adm-page-body">
            <Panel key={activeTab} {...panelProps} />
          </div>
        </main>
      </div>
    </div>
  );
}
