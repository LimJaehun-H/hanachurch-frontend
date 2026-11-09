import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// 가지형 조직도: 하나교회 → 부(가로로 나란히) → 팀(세로로 가지) → 묶음 안의 팀(한 단계 더 들여쓰기)
// 폭이 넓으면 이 영역 안에서만 옆으로 밀어서 봄 (페이지 전체는 가로 스크롤 없음)

export default function MinistryOrgChart({ tree }) {
  const scrollRef = useRef(null);
  const [overflow, setOverflow] = useState(false); // 조직도가 화면보다 넓을 때만 안내
  const { root, colorOf, hasPage } = tree;

  // 처음엔 하나교회가 가운데 오게
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 2);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const Name = ({ node, className }) =>
    hasPage(node.id) ? (
      <Link to={`/ministry/${node.id}`} className={`${className} oc-link`}>
        {node.name}
      </Link>
    ) : (
      <span className={className}>{node.name}</span>
    );

  const Branch = ({ node }) => {
    const kids = node.children || [];
    return (
      <li className="oc-item">
        <Name node={node} className={`oc-team ${kids.length ? "oc-team--group" : ""}`} />
        {kids.length > 0 && (
          <ul className="oc-sub">
            {kids.map((c) => (
              <Branch key={c.id} node={c} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="oc-wrap">
      {overflow && <p className="oc-hint">← 옆으로 밀어서 전체 보기 →</p>}
      <div className="oc-scroll" ref={scrollRef}>
        <div className="oc">
          <div className="oc-root">
            <img src="/icon-512.png" alt="" />
            {root.name}
          </div>
          <ul className="oc-depts">
            {root.children.map((dept) => (
              <li key={dept.id} className="oc-col" style={{ "--mc": colorOf(dept.id) }}>
                <Name node={dept} className="oc-dept" />
                {(dept.children || []).length > 0 && (
                  <ul className="oc-list">
                    {dept.children.map((c) => (
                      <Branch key={c.id} node={c} />
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
