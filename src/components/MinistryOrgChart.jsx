import React from "react";
import { Link } from "react-router-dom";

// 위아래 조직도: 하나교회 → 부 → 묶음 → 팀, 모든 단계를 칸과 선으로 이음
// PC: 부 7개가 가로로 나란히, 각 부 아래로 묶음·팀이 가지처럼 내려감
// 폰·태블릿: 왼쪽 세로줄에서 부가 차례로 이어지고, 그 아래로 같은 가지 (옆으로 밀 필요 없음)
// 소개 페이지가 있는 이름만 링크 (백엔드 hasPage)

export default function MinistryOrgChart({ tree }) {
  const { root, colorOf, hasPage } = tree;

  return (
    <div className="org">
      <div className="org-root">
        <img src="/icon-512.png" alt="" />
        {root.name}
      </div>
      <div className="org-trunk" aria-hidden="true" />
      <ul className="org-depts">
        {root.children.map((dept) => (
          <li key={dept.id} className="org-col" style={{ "--mc": colorOf(dept.id) }}>
            {hasPage(dept.id) ? (
              <Link to={`/ministry/${dept.id}`} className="org-dept">
                <span>{dept.name}</span>
                <small>소개</small>
              </Link>
            ) : (
              <div className="org-dept">
                <span>{dept.name}</span>
              </div>
            )}
            <Branch nodes={dept.children} hasPage={hasPage} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// 하위 가지 (묶음이면 그 아래로 한 번 더)
function Branch({ nodes, hasPage }) {
  if (!nodes?.length) return null;
  return (
    <ul className="org-tree">
      {nodes.map((n) => {
        const isGroup = n.children?.length > 0;
        const cls = `org-node ${isGroup ? "org-node--group" : "org-node--team"}`;
        return (
          <li key={n.id}>
            {hasPage(n.id) ? (
              <Link to={`/ministry/${n.id}`} className={`${cls} org-node--link`}>
                {n.name}
              </Link>
            ) : (
              <span className={`${cls} ${isGroup ? "" : "org-node--plain"}`}>{n.name}</span>
            )}
            {isGroup && <Branch nodes={n.children} hasPage={hasPage} />}
          </li>
        );
      })}
    </ul>
  );
}
