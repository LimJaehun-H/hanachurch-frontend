import React from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="hc-page-transition">
      {children}
    </div>
  );
}