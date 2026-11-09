import { makeTree, EXAMPLE_PAGES } from "./ministries.js";

// Good Works (사역박람회 팸플릿 기준 부서소개) 시안 데이터
// 팸플릿 45개에서 중복 3쌍을 합쳐 팀·활동 36개를 부 7개 아래로, 비슷한 팀끼리 한 번 더 묶음
// "확인 필요" 주석: 기존 부서 맵에 없어서 성격을 보고 넣은 위치
export const GOOD_WORKS_ROOT = {
  id: "root",
  name: "하나교회",
  children: [
    {
      id: "worship",
      name: "예배부",
      children: [
        {
          id: "praise",
          name: "찬양팀",
          children: [
            { id: "praise-1", name: "1부 봉사자 예배 찬양팀" },
            { id: "praise-2-4", name: "2·4부 청소년 청년 찬양팀" },
            { id: "praise-3", name: "3부 대예배 찬양팀" }, // 확인 필요
            { id: "praise-friday", name: "금요심야기도회 찬양팀" },
            { id: "praise-new", name: "새로 세워지는 찬양팀" }, // 확인 필요
          ],
        },
        {
          id: "worship-care",
          name: "예배 섬김",
          children: [
            { id: "guide", name: "안내팀" },
            { id: "communion", name: "성찬팀" },
            { id: "newcomer", name: "새가족 등록 및 관리" },
            { id: "intercession", name: "중보기도팀" }, // 확인 필요
          ],
        },
        {
          id: "worship-media-group",
          name: "예배 미디어",
          children: [
            { id: "worship-media", name: "예배 미디어 운용 및 관리팀" }, // 확인 필요 (기존 맵에선 관리부)
            { id: "dawn-sound", name: "새벽예배 음향담당" }, // 확인 필요
          ],
        },
      ],
    },
    {
      id: "education",
      name: "교육부",
      children: [
        {
          id: "church-school",
          name: "교회학교",
          children: [
            { id: "preschool-teachers", name: "영유치부교사" },
            { id: "children-teachers", name: "어린이부교사" },
            { id: "kids-bus", name: "차량 운행" },
          ],
        },
        {
          id: "word-learning",
          name: "말씀과 배움",
          children: [
            { id: "library", name: "책마실 작은도서관" },
            { id: "bible-reading", name: "성경읽기" }, // 확인 필요
          ],
        },
        {
          id: "promotion",
          name: "홍보",
          children: [{ id: "instagram", name: "인스타그램팀" }],
        },
      ],
    },
    {
      id: "mission",
      name: "선교부",
      children: [
        {
          id: "evangelism",
          name: "전도",
          children: [
            { id: "dawn-evangelism", name: "새벽전도팀" },
            { id: "walnut", name: "호두과자 전도팀" },
            { id: "cleanup", name: "클린업 전도대" },
          ],
        },
      ],
    },
    {
      id: "social",
      name: "사회봉사부",
      children: [
        {
          id: "kitchen",
          name: "주방",
          children: [
            { id: "kitchen-serve", name: "주방봉사팀" },
            { id: "kitchen-dish", name: "주방정리" }, // = 주방설거지팀, 설거지 및 주방정리
          ],
        },
        {
          id: "record",
          name: "기록",
          children: [{ id: "photo", name: "사진촬영팀" }],
        },
      ],
    },
    {
      id: "facility",
      name: "관리부",
      children: [
        {
          id: "facility-energy",
          name: "시설 및 에너지 관리",
          children: [
            { id: "building", name: "교회 건물 시설관리팀" },
            { id: "electric", name: "전기 관리팀" },
          ],
        },
        {
          id: "cleaning",
          name: "청소",
          children: [
            { id: "stairs-cleaning", name: "전층 계단 청소팀" },
            { id: "restroom-cleaning", name: "1층 화장실청소" }, // 확인 필요
          ],
        },
        {
          id: "storage-group",
          name: "창고 관리",
          children: [
            { id: "storage", name: "창고 관리팀" },
            { id: "storage-3f", name: "3층 창고관리팀" }, // 확인 필요
          ],
        },
        {
          id: "space-care",
          name: "공간 관리",
          children: [
            { id: "youth-room", name: "청년부 공간 관리팀" },
            { id: "newcomer-room", name: "새가족실 정리팀" }, // 예배부에서 옮김
            { id: "parking", name: "주차관리팀" }, // 확인 필요
          ],
        },
        {
          id: "space-decor",
          name: "공간 꾸미기",
          children: [
            { id: "pulpit", name: "강단보 관리팀" }, // = 예배실 관리, 예배부(예배 환경)에서 옮김
            { id: "flower", name: "꽃꽂이팀" }, // 예배부(예배 환경)에서 옮김
            { id: "decoration", name: "교회 장식팀" }, // 예배부(예배 환경)에서 옮김
          ],
        },
      ],
    },
    { id: "finance", name: "재무부" },
    {
      id: "admin-planning",
      name: "행정 및 기획",
      children: [
        { id: "planning", name: "기획팀" }, // 팸플릿: 행사 및 양육 기획팀
        { id: "office", name: "행정팀" },
      ],
    },
  ],
};

// 소개 페이지는 아직 주방봉사팀 예시만 있음
export const GOOD_WORKS_TREE = makeTree(GOOD_WORKS_ROOT, { hasPage: (id) => EXAMPLE_PAGES.has(id) });
