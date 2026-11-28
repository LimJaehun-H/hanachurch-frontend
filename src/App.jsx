import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home.jsx";
import Worship from "./pages/Worship.jsx";
import Notice from "./pages/Notice.jsx";
import Bulletin from "./pages/Bulletin.jsx";
import Location from "./pages/Location.jsx";
import Admin from "./pages/Admin.jsx";
import Album from "./pages/Album.jsx";
import About from "./pages/About.jsx";
import WorshipSunday from "./pages/WorshipSunday.jsx";
import WorshipDawn from "./pages/WorshipDawn.jsx";
import AlbumDetail from "./pages/AlbumDetail.jsx";
import BulletinDetail from "./pages/BulletinDetail.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PageTransition from "./components/PageTransition.jsx";
import NoticeDetail from "./pages/NoticeDetail.jsx";
import SermonDetail from "./pages/SermonDetail.jsx";
// 온라인 헌금: 지금은 사용 안 함 (페이지 파일과 백엔드는 그대로 둠, 다시 열 때 아래 주석 해제)
// import Offering from "./pages/Offering.jsx";
// import OfferingSuccess from "./pages/OfferingSuccess.jsx";
// import OfferingFail from "./pages/OfferingFail.jsx";
import SignupAgree from "./pages/SignupAgree.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import KakaoCallback from "./pages/KakaoCallback.jsx";
import KakaoSignup from "./pages/KakaoSignup.jsx";
import MyPage from "./pages/MyPage.jsx";
import Privacy from "./pages/Privacy.jsx";

// 교회부서는 조직도 라이브러리(d3)가 들어가서, 들어갈 때만 불러옴
const Ministry = lazy(() => import("./pages/Ministry.jsx"));
const MinistryDetail = lazy(() => import("./pages/MinistryDetail.jsx"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/worship" element={<Worship />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/bulletin" element={<Bulletin />} />
          <Route path="/location" element={<Location />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/album" element={<Album />} />
          <Route path="/about" element={<About />} />
          <Route path="/ministry" element={<Suspense fallback={null}><Ministry /></Suspense>} />
          <Route path="/ministry/:id" element={<Suspense fallback={null}><MinistryDetail /></Suspense>} />
          <Route path="/worship/sunday" element={<WorshipSunday />} />
          <Route path="/worship/dawn" element={<WorshipDawn />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route path="/bulletin/:id" element={<BulletinDetail />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/sermon/:id" element={<SermonDetail />} />
          {/* 온라인 헌금: 메뉴와 주소 모두 닫아 둠. 주소로 들어오면 홈으로 보냄
          <Route path="/offering" element={<Offering />} />
          <Route path="/offering/success" element={<OfferingSuccess />} />
          <Route path="/offering/fail" element={<OfferingFail />} />
          */}
          <Route path="/offering/*" element={<Navigate to="/" replace />} />
          <Route path="/signup/agree" element={<SignupAgree />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/kakao" element={<KakaoCallback />} />
          <Route path="/signup/kakao" element={<KakaoSignup />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </PageTransition>
    </>
  );
}
