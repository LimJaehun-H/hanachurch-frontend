import React from "react";
import { Link } from "react-router-dom";

// 위아래 조직도: 하나교회 → 부 → 묶음 → 팀
// PC: 부 7개가 가로로 나란히, 각 부 아래로 묶음·팀이 내려감
// 폰·태블릿: 왼쪽 세로줄에서 부 카드가 차례로 이어짐 (옆으로 밀 필요 없음)
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
            <Dept dept={dept} hasPage={hasPage} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dept({ dept, hasPage }) {
  const kids = dept.children || [];
  // 묶음(하위 팀이 있는 것)과 부 바로 아래 팀을 나눔
  const groups = kids.filter((c) => c.children?.length);
  const direct = kids.filter((c) => !c.children?.length);

  return (
    <section className="org-card">
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
      {kids.length > 0 && (
        <div className="org-body">
          {direct.length > 0 && <Teams teams={direct} hasPage={hasPage} />}
          {groups.map((g) => (
            <div key={g.id} className="org-group">
              <h3 className="org-group-name">{g.name}</h3>
              <Teams teams={g.children} hasPage={hasPage} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Teams({ teams, hasPage }) {
  return (
    <ul className="org-teams">
      {teams.map((t) => (
        <li key={t.id}>
          {hasPage(t.id) ? (
            <Link to={`/ministry/${t.id}`} className="org-team">
              {t.name}
            </Link>
          ) : (
            <span className="org-team org-team--plain">{t.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
