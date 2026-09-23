import React from "react";
import { Routes, Route } from "react-router-dom";
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
import Offering from "./pages/Offering.jsx";
import OfferingSuccess from "./pages/OfferingSuccess.jsx";
import OfferingFail from "./pages/OfferingFail.jsx";

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
          <Route path="/worship/sunday" element={<WorshipSunday />} />
          <Route path="/worship/dawn" element={<WorshipDawn />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route path="/bulletin/:id" element={<BulletinDetail />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/sermon/:id" element={<SermonDetail />} />
          <Route path="/offering" element={<Offering />} />
          <Route path="/offering/success" element={<OfferingSuccess />} />
          <Route path="/offering/fail" element={<OfferingFail />} />
        </Routes>
      </PageTransition>
    </>
  );
}