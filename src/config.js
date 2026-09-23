// // 이 파일 값들만 바꾸면 사이트 전체에 반영됩니다.

// export const API_BASE_URL = "https://3.107.22.119.nip.io";

// // public/images 폴더에 사진 넣고 파일명만 바꿔주면 됩니다.
// // 예: public/images/hero.jpg 에 넣었으면 "/images/hero.jpg"
// // 없으면 null로 두면 그라데이션 배경으로 자동 대체됩니다.
// export const HERO_VIDEO_URL = "/videos/hero.mp4";

// // 예배명 하나에 여러 부(1부/2부 등)가 있으면 parts 배열에 추가하면 됩니다.
// // 하나의 예배에 부가 없으면 part는 빈 문자열("")로 두면 됩니다.
// export const WORSHIP_SCHEDULE = [
//   {
//     group: "주일예배",
//     parts: [
//       { part: "1부", time: "오전 8:00", location: "대예배실" },
//       { part: "2부", time: "오전 9:30", location: "대예배실" },
//       { part: "3부", time: "오전 11:00", location: "대예배실" },
//       { part: "4부", time: "오후 1:00", location: "대예배실" },
//     ],
//   },
//   {
//     group: "금요예배",
//     parts: [{ part: "", time: "오후 8:00", location: "대예배실" }],
//   },
//   {
//     group: "새벽예배",
//     parts: [{ part: "", time: "오전 5:00", location: "대예배실" }],
//   },
// ];

// export const CHURCH_INFO = {
//   name: "하나교회",
//   address: "경기 안산시 단원구 화정로 5",
//   phone: "031-405-9595",
//   instagram: "@_hanachurch_",
// };

// // 하단 정보 영역 (오시는 길 링크, 주소 여러 줄, 연락처)
// export const FOOTER_INFO = {
//   // "찾아오시는 길" 클릭 시 이동할 지도 링크 (네이버지도/카카오맵 등)
//   mapUrl: "https://map.naver.com",
//   // 주소는 줄 단위로 원하는 만큼 추가/삭제 가능
//   addressLines: [
//     "15369 경기 안산시 단원구 화정로 5  |  전화 : 031-405-9595"
//   ]
// };

// // 오시는 길 페이지 카카오맵 설정
// export const MAP_CONFIG = {
//   // 카카오 개발자 콘솔에서 발급받은 JavaScript 키
//   kakaoJsKey: "3b32233f780a69d054c6d3df025745ab",
//   // 지도에서 검색할 주소 (우편번호/전화번호 등은 빼고 순수 주소만)
//   address: "경기 안산시 단원구 화정로 5",
//   // 지도 확대 레벨 (숫자가 작을수록 더 확대됨, 1~14)
//   level: 3,
// };
// 이 파일 값들만 바꾸면 사이트 전체에 반영됩니다.

export const API_BASE_URL = "https://13.210.86.184.nip.io";
// export const API_BASE_URL = "http://localhost:8080";

// 토스페이먼츠 클라이언트 키 (공개키, 테스트키로 시작 — 실결제 승인 나면 live_ck_ 로 교체)
export const TOSS_CLIENT_KEY = "test_ck_여기에_토스페이먼츠_테스트_클라이언트키_입력";

// public/images 폴더에 사진 넣고 파일명만 바꿔주면 됩니다.
// 예: public/images/hero.jpg 에 넣었으면 "/images/hero.jpg"
// 없으면 null로 두면 그라데이션 배경으로 자동 대체됩니다.
export const HERO_IMAGE_URL = "images/hana.jpg";

// public/videos 폴더에 영상 넣고 파일명만 바꿔주면 됩니다.
// 영상이 있으면 이미지보다 우선 재생됩니다. 없으면 null로 두세요.
// export const HERO_VIDEO_URL = "/videos/hero.mp4";

// 예배명 하나에 여러 부(1부/2부 등)가 있으면 parts 배열에 추가하면 됩니다.
// 하나의 예배에 부가 없으면 part는 빈 문자열("")로 두면 됩니다.
export const WORSHIP_SCHEDULE = [
  {
    group: "주일예배",
    parts: [
      { part: "1부예배", time: "오전 8:00", location: "대예배실" },
      { part: "2부예배", time: "오전 9:30", location: "대예배실" },
      { part: "3부예배", time: "오전 11:00", location: "대예배실" },
      { part: "4부예배", time: "오후 1:00", location: "대예배실" },
    ],
  },
  {
    group: "주중예배",
    parts: [
      { part: "금요예배", time: "오후 8:00", location: "대예배실" },
      { part: "새벽예배", time: "매일 오전 5:00", location: "대예배실" },  
    ],
  },

];

export const CHURCH_INFO = {
  name: "하나교회",
  denomination: "기독교대한감리회",
  address: "경기 안산시 단원구 화정로 5",
  phone: "031-405-9595",
  instagram: "@_hanachurch_",
};

// 하단 정보 영역 (오시는 길 링크, 주소 여러 줄, 연락처)
export const FOOTER_INFO = {
  // "찾아오시는 길" 클릭 시 이동할 지도 링크 (네이버지도/카카오맵 등)
  mapUrl: "https://map.naver.com",
  // 주소는 줄 단위로 원하는 만큼 추가/삭제 가능
  addressLines: [
    "15369 경기 안산시 단원구 화정로 5  |  전화 : 031-405-9595"
  ]
};

// 오시는 길 페이지 카카오맵 설정
export const MAP_CONFIG = {
  // 카카오 개발자 콘솔에서 발급받은 JavaScript 키
  kakaoJsKey: "3b32233f780a69d054c6d3df025745ab",
  // 지도에서 검색할 주소 (우편번호/전화번호 등은 빼고 순수 주소만)
  address: "경기 안산시 단원구 화정로 5",
  // 지도 확대 레벨 (숫자가 작을수록 더 확대됨, 1~14)
  level: 3,
};

export const BULLETIN_HERO_IMAGE_URL = "images/bulletin-hero.jpg";
export const WORSHIP_HERO_IMAGE_URL = "images/worship-hero.jpg";
export const NOTICE_HERO_IMAGE_URL = "images/notice-hero.jpg";
export const LOCATION_HERO_IMAGE_URL = "images/location-hero.jpg";
export const ALBUM_HERO_IMAGE_URL = "images/album-hero.jpg";
export const ABOUT_HERO_IMAGE_URL = "images/about-hero.jpg";
export const DONATION_HERO_IMAGE_URL = null;

// 교회소개 본문("교회소개 / 준비중입니다..." 영역) 뒤에 깔리는 고정 배경 사진
// 스크롤해도 이 사진 자체는 움직이지 않고, 그 위로 텍스트만 스크롤됩니다
export const ABOUT_CONTENT_BG_IMAGE_URL = null;

// 교회소개 페이지 상단 패럴랙스 배경 (홈 배너와 동일한 방식, 이미지만 별도)
export const ABOUT_PARALLAX_IMAGE_URL = null;
// 문구는 나중에 정해지면 여기 텍스트만 채우면 됩니다 (비워두면 사진+오버레이만 보임)
export const ABOUT_PARALLAX_TITLE = null;
export const ABOUT_PARALLAX_SUBTITLE = null;
export const SUNDAY_WORSHIP_HERO_IMAGE_URL = "images/sunday-worship-hero.jpg";
export const DAWN_WORSHIP_HERO_IMAGE_URL = "images/dawn-worship-hero.jpg";
export const HOME_GALLERY_IMAGES = [
  "images/gallery-1.jpg",
  "images/gallery-2.jpg",
  "images/gallery-3.jpg",
  "images/gallery-4.jpg",
  "images/gallery-5.jpg",
  "images/gallery-6.jpg",
];
export const WORSHIP_PAGE_BG_IMAGE_URL = "images/worship-bg.jpg";

export const WORSHIP_GALLERY_IMAGES = [
  "images/worship-1.jpg",
  "images/worship-2.jpg",
  "images/worship-3.jpg",
  "images/worship-4.jpg",
  "images/worship-5.jpg",
  "images/worship-6.jpg",
];
export const CHURCH_SCHOOL_SCHEDULE = [
  {
    group: "영유아부",
    parts: [{ part: "", time: "주일 오전 10시 45분", location: "영유치부공과실" }],
  },
  {
    group: "어린이부",
    parts: [{ part: "", time: "주일 오전 10시 30분", location: "어린이공과실" }],
  },
];

export const CHURCH_SCHOOL_GALLERY_IMAGES = [
  "images/church-school-1.jpg",
  "images/church-school-2.jpg",
  "images/church-school-3.jpg",
  "images/church-school-4.jpg",
];

export const HERO_LOGO_IMAGE_URL = "images/hana-logo.png";

// 좌측 상단 헤더의 "하나교회" 워드마크 자리에 넣을 로고 이미지
// 관리자 페이지에서 업로드하지 않으면 지금처럼 텍스트("하나교회")가 그대로 보임
// HEADER_LOGO_WHITE_IMAGE_URL = 히어로 위 투명 상태 (맨 위, 스크롤 전) 로고 → 흰색 버전
// HEADER_LOGO_DARK_IMAGE_URL  = 흰 배경 상태 (스크롤 후 / 내부 페이지) 로고 → 원래 색(컬러) 버전
export const HEADER_LOGO_WHITE_IMAGE_URL = null;
export const HEADER_LOGO_DARK_IMAGE_URL = null;

// 하단 푸터의 "하나교회" 텍스트 자리에 넣을 로고 (전체 흰색 버전, 어두운 푸터 배경용)
export const FOOTER_LOGO_WHITE_IMAGE_URL = null;

// 홈 화면 "예배안내" 섹션에 들어가는 말씀 구절 (여기 텍스트만 바꾸면 됩니다)
export const WORSHIP_PREVIEW_VERSE = "말씀 가능";

// 홈 화면 "인스타그램 등 아이콘" 섹션과 "예배안내" 사이 풀블리드 배너
// (스크롤하면 배경은 고정된 채 문구가 아래에서 올라오는 효과)
export const HOME_BANNER_IMAGE_URL = "images/home-banner.jpg";
// 지금은 비워두고, 나중에 문구 넣고 싶을 때 이 두 줄만 채우면 됩니다.
export const HOME_BANNER_TITLE = "으하하하하하";
export const HOME_BANNER_SUBTITLE = "I am spiderman";



// 홈 화면 "예배안내" 섹션 전용 사진 4장 (예배안내 페이지 사진과 별개, 여기 경로만 바꾸면 됩니다)
export const WORSHIP_PREVIEW_IMAGES = [
  "images/home-worship-1.jpg",
  "images/home-worship-2.jpg",
  "images/home-worship-3.jpg",
  "images/home-worship-4.jpg",
];

// 상단 네비게이션 구조 (Header.jsx 드롭다운과 동일하게 유지해주세요)
// matchPrefixes: 이 그룹/항목에 속하는 것으로 인식할 추가 경로 (상세페이지 등)
export const NAV_GROUPS = [
  {
    label: "교회소개",
    items: [
      { label: "예배안내", to: "/worship" },
      { label: "오시는 길", to: "/location" },
      { label: "교회소개", to: "/about" },
    ],
  },
  {
    label: "예배와 말씀",
    items: [
      { label: "주일예배", to: "/worship/sunday", matchPrefixes: ["/worship/sunday", "/sermon"] },
      { label: "새벽예배", to: "/worship/dawn" },
    ],
  },
  {
    label: "교회소식",
    items: [
      { label: "교회공지", to: "/notice" },
      { label: "교회주보", to: "/bulletin" },
      { label: "교회앨범", to: "/album" },
    ],
  },
];
// 어떤 자리(groupKey)들이 있고, 각각 단일형인지 갤러리형인지 정의
// 나중에 새 이미지 자리가 필요하면, 여기에 한 줄만 추가하면 됩니다.
export const SITE_IMAGE_GROUPS = [
  { key: "notice_hero", label: "교회공지 배너", type: "single" },
  { key: "bulletin_hero", label: "교회주보 배너", type: "single" },
  { key: "worship_hero", label: "예배안내 배너", type: "single" },
  { key: "location_hero", label: "오시는길 배너", type: "single" },
  { key: "album_hero", label: "교회앨범 배너", type: "single" },
  { key: "about_hero", label: "교회소개 배너", type: "single" },
  { key: "donation_hero", label: "온라인 헌금 배너", type: "single" },
  { key: "about_content_bg", label: "교회소개 본문 고정 배경", type: "single" },
  { key: "sunday_worship_hero", label: "주일예배 배너", type: "single" },
  { key: "dawn_worship_hero", label: "새벽예배 배너", type: "single" },
  { key: "worship_preview", label: "홈 예배안내 사진", type: "gallery" },
  { key: "home_gallery", label: "홈 갤러리 사진", type: "gallery" },
  { key: "home_hero_image", label: "홈 배경 이미지", type: "single" },
  { key: "home_logo", label: "홈 로고", type: "single" },
  { key: "header_logo_white", label: "헤더 로고 (흰색, 맨 위)", type: "single" },
  { key: "header_logo_dark", label: "헤더 로고 (기본/컬러, 스크롤 시)", type: "single" },
  { key: "footer_logo_white", label: "푸터 로고 (전체 흰색)", type: "single" },
  { key: "home_banner", label: "홈 패럴랙스 배너", type: "single" },
  { key: "worship_page_bg", label: "예배안내 배경사진", type: "single" },
  { key: "home_banner_badge", label: "홈 배너 배지/로고 이미지", type: "single" },
  { key: "worship_gallery", label: "예배안내 상세 사진들", type: "gallery" },
  { key: "church_school_gallery", label: "교회학교 예배 사진들", type: "gallery" },
];