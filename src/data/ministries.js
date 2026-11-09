// 교회부서 구조 (교회 조직도 그림에서 옮겨 적음)
// - id: 주소에 쓰이는 영문 이름 (/ministry/:id). 한 번 정하면 바꾸지 않는 게 좋음
// - name: 화면에 보이는 이름
// - desc: 부서 소개 글 (비어 있으면 "준비 중" 안내가 보임)
// - children: 하위 부서
// 그림 글씨가 작아 확실하지 않은 이름에는 "확인 필요" 주석을 달아 둠

export const CHURCH_ROOT = {
  id: "root",
  name: "하나교회",
  children: [
    {
      id: "finance",
      name: "재무부",
      children: [{ id: "offering-count", name: "헌금 개수" }],
    },
    {
      id: "admin-planning",
      name: "행정 및 기획팀",
      children: [
        { id: "planning", name: "기획팀" },
        { id: "office", name: "사무행정" },
      ],
    },
    {
      id: "worship",
      name: "예배부",
      children: [
        {
          id: "praise",
          name: "찬양 및 음악팀",
          children: [
            { id: "praise-1", name: "1부 찬양팀" },
            { id: "praise-2-4", name: "2,4부 찬양팀" },
            { id: "praise-friday", name: "금요심야기도회 찬양팀" }, // 확인 필요
          ],
        },
        {
          id: "usher",
          name: "예배 의전 및 안내",
          children: [
            { id: "guide", name: "안내팀" },
            { id: "communion", name: "성찬팀" },
          ],
        },
        {
          id: "worship-setup",
          name: "예배 준비 및 세팅",
          children: [
            { id: "setup-friday", name: "금요심야예배 세팅" }, // 확인 필요
            { id: "setup-pulpit", name: "교회력 강단보 교체 담당" }, // 확인 필요
            { id: "setup-dawn", name: "새벽예배 세팅" },
          ],
        },
        { id: "newcomer", name: "새신자 등록 및 관리" },
      ],
    },
    {
      id: "education",
      name: "교육부",
      children: [
        { id: "kids-bus", name: "영유치부/어린이부 차량운행" }, // 확인 필요
        {
          id: "youth-library",
          name: "청년 및 도서관",
          children: [
            { id: "youth", name: "청년부" },
            { id: "library", name: "책마실 작은 도서관" }, // 확인 필요
          ],
        },
        {
          id: "next-gen",
          name: "다음 세대 교육 사역",
          children: [
            { id: "preschool-teachers", name: "영유치부 교사" },
            { id: "children-teachers", name: "어린이부 교사" },
            { id: "teens", name: "청소년부" },
          ],
        },
        { id: "promotion", name: "홍보팀" },
      ],
    },
    {
      id: "social",
      name: "사회봉사부",
      children: [
        {
          id: "outreach-record",
          name: "대외 협력 및 기록",
          children: [
            { id: "photo", name: "사진 촬영" },
            { id: "love-walk", name: "하나인 사랑의 걷기 대회" }, // 확인 필요
          ],
        },
        {
          id: "relief",
          name: "구제 및 경조사 지원",
          children: [
            { id: "family-events", name: "경조사팀" },
            { id: "relief-team", name: "구제팀" },
          ],
        },
        {
          id: "kitchen",
          name: "급식 및 주방 지원",
          children: [
            { id: "kitchen-serve", name: "주방 봉사" },
            { id: "kitchen-dish", name: "주방 설거지" },
          ],
        },
      ],
    },
    {
      id: "mission",
      name: "선교부",
      children: [
        {
          id: "evangelism",
          name: "전도 특화 사역",
          children: [
            { id: "dawn-evangelism", name: "새벽 전도팀" },
            { id: "walnut", name: "호두과자팀" },
            { id: "cleanup", name: "클린업 전도대" },
          ],
        },
        { id: "spring-team", name: "시작해 봄 팀" }, // 확인 필요
        { id: "autumn-team", name: "가을애 팀" }, // 확인 필요
      ],
    },
    {
      id: "facility",
      name: "관리부",
      children: [
        {
          id: "energy",
          name: "시설 및 에너지 관리",
          children: [
            { id: "electric", name: "전기관리" },
            { id: "sunday-electric", name: "주일 전체 전기 확인" },
            { id: "sunday-heating", name: "주일 전체 난방 확인" },
          ],
        },
        {
          id: "cleaning",
          name: "청소",
          children: [
            { id: "weekly-cleaning", name: "주간 청소 1,2" },
            { id: "outdoor-cleaning", name: "외부청소" },
            { id: "stairs-cleaning", name: "전층 계단 청소" },
          ],
        },
        {
          id: "storage",
          name: "창고 관리",
          children: [
            { id: "storage-b1", name: "지하 1층 창고 정리" },
            { id: "storage-1f", name: "1층 창고 관리" },
            { id: "youth-room", name: "남녀 청년부실 관리" }, // 확인 필요
          ],
        },
        { id: "media", name: "미디어 장비 관리" },
      ],
    },
  ],
};

// 큰 부서별 색 (하위로 갈수록 같은 색이 연해짐)
export const BRANCH_COLORS = {
  finance: "#3E5BA9",
  "admin-planning": "#6B57A8",
  worship: "#C2476A",
  education: "#2E8B8B",
  social: "#D98324",
  mission: "#3E8E4E",
  facility: "#5B6B7F",
};
export const ROOT_COLOR = "#2D6A3E";

// 나무 구조를 펼쳐 id로 찾기 쉽게: { id: { node, parent, depth, branch, path } }
export const MINISTRY_INDEX = {};
(function build(node, parent, depth, branch, path) {
  const myBranch = depth === 1 ? node.id : branch;
  const myPath = [...path, node];
  MINISTRY_INDEX[node.id] = { node, parent, depth, branch: myBranch, path: myPath };
  (node.children || []).forEach((c) => build(c, node, depth + 1, myBranch, myPath));
})(CHURCH_ROOT, null, 0, null, []);

export function colorOf(id) {
  const info = MINISTRY_INDEX[id];
  if (!info || info.depth === 0) return ROOT_COLOR;
  return BRANCH_COLORS[info.branch] || ROOT_COLOR;
}

// 소개 페이지가 있는 부서: 큰 부서와 그 바로 아래 단계까지 (맨 끝 팀은 조직도 카드로만 안내)
// 새 디자인(A) 예시 페이지가 있는 팀 (목사님 확인용, 나중에 백엔드 데이터로 대체)
export const EXAMPLE_PAGES = new Set(["kitchen-serve"]);

export function hasPage(id) {
  const info = MINISTRY_INDEX[id];
  if (EXAMPLE_PAGES.has(id)) return true;
  return Boolean(info) && info.depth >= 1 && info.depth <= 2;
}

// 다른 부서 트리(예: Good Works)도 같은 방식으로 쓰기 위한 도우미
// root: { id, name, children }, 큰 부서 id가 BRANCH_COLORS에 있으면 그 색을 씀
export function makeTree(root, { hasPage: pageFn } = {}) {
  const index = {};
  (function walk(node, parent, depth, branch, path) {
    const myBranch = depth === 1 ? node.id : branch;
    const myPath = [...path, node];
    index[node.id] = { node, parent, depth, branch: myBranch, path: myPath };
    (node.children || []).forEach((c) => walk(c, node, depth + 1, myBranch, myPath));
  })(root, null, 0, null, []);
  const color = (id) => {
    const info = index[id];
    if (!info || info.depth === 0) return ROOT_COLOR;
    return BRANCH_COLORS[info.branch] || ROOT_COLOR;
  };
  return { root, index, colorOf: color, hasPage: pageFn || (() => false) };
}

// 기존 부서 맵(/ministry)용
export const MINISTRY_TREE = { root: CHURCH_ROOT, index: MINISTRY_INDEX, colorOf, hasPage };

