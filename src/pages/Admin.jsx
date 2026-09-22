import React, { useState } from "react";
import Header from "../components/Header.jsx";
import AdminNoticePanel from "../components/AdminNoticePanel.jsx";
import AdminBulletinPanel from "../components/AdminBulletinPanel.jsx";
import AdminAlbumPanel from "../components/AdminAlbumPanel.jsx";
import AdminSermonPanel from "../components/AdminSermonPanel.jsx";
import AdminHomeVideoPanel from "../components/AdminHomeVideoPanel.jsx";
import AdminSiteImagePanel from "../components/AdminSiteImagePanel.jsx";
import AdminPasswordPanel from "../components/AdminPasswordPanel.jsx";
import { API_BASE_URL } from "../config.js";

const TABS = [
  { key: "password", label: "비밀번호 변경" },
  { key: "notice", label: "교회소식 관리" },
  { key: "bulletin", label: "주보 관리" },
  { key: "album", label: "앨범 관리" },
  { key: "sermon", label: "말씀 관리" },
  { key: "homevideo", label: "홈화면 영상 관리" },
  { key: "siteimage", label: "사이트 이미지 관리" },
];

export default function Admin() {
  // 토큰은 이 컴포넌트의 메모리에만 존재합니다.
  // 페이지를 벗어났다가(다른 메뉴 클릭 등) 다시 "관리자"로 들어오면 항상 초기화되어 로그인부터 다시 해야 합니다.
  const [token, setToken] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [activeTab, setActiveTab] = useState("password");

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
    setToken(null);
  };

  const panelProps = { token, onAuthExpired: handleAuthExpired };

  return (
    <div className="hc-page">
      <Header variant="solid" />

      {!token && (
        <main className="hc-admin-login-page">
          <div className="hc-admin-login-card">
            <p className="hc-eyebrow">admin</p>
            <h1 className="hc-h1">관리자</h1>
            <form className="hc-admin-login" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="아이디"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="hc-admin-btn">로그인</button>
              {loginError && <p className="hc-admin-status err">{loginError}</p>}
            </form>
          </div>
        </main>
      )}

      {token && (
        <div className="hc-admin-shell">
          <aside className="hc-admin-sidebar">
            <p className="hc-admin-sidebar-title">관리자</p>
            <nav className="hc-admin-sidebar-nav">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`hc-admin-sidebar-item ${activeTab === tab.key ? "hc-admin-sidebar-item--active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button className="hc-admin-sidebar-logout" onClick={handleLogout}>
              로그아웃
            </button>
          </aside>

          <main className="hc-admin-content">
            <h2 className="hc-admin-content-title">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h2>
            <div className="hc-admin-content-body">
              {activeTab === "password" && <AdminPasswordPanel {...panelProps} />}
              {activeTab === "notice" && <AdminNoticePanel {...panelProps} />}
              {activeTab === "bulletin" && <AdminBulletinPanel {...panelProps} />}
              {activeTab === "album" && <AdminAlbumPanel {...panelProps} />}
              {activeTab === "sermon" && <AdminSermonPanel {...panelProps} />}
              {activeTab === "homevideo" && <AdminHomeVideoPanel {...panelProps} />}
              {activeTab === "siteimage" && <AdminSiteImagePanel {...panelProps} />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}