import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { CHURCH_INFO } from "../config.js";

// ⚠️ 아직 정해지지 않은 값 — 확정되면 여기만 바꾸면 됨
const EFFECTIVE_DATE = ""; // 시행일 (예: "2026년 11월 1일")
const OFFERING_RETENTION = ""; // 헌금 기록 보관 기간 (예: "5년")
const MANAGER = {
  position: "담임목사",
  name: "", // 성함
  phone: CHURCH_INFO.phone,
};

// 미정 값은 눈에 띄게 표시
function Pending({ value, label = "미정" }) {
  return value ? <>{value}</> : <span className="hc-privacy-pending">({label})</span>;
}

export default function Privacy() {
  const church = CHURCH_INFO.name;

  return (
    <div className="hc-page">
      <Header variant="solid" />

      <main className="hc-privacy-page">
        <h1 className="hc-privacy-title">개인정보처리방침</h1>
        <p className="hc-privacy-intro">
          {church}(이하 "교회")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고
          이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을
          수립·공개합니다.
        </p>

        <section className="hc-privacy-section">
          <h2>제1조 (개인정보의 처리 목적)</h2>
          <p>교회는 다음 목적을 위하여 개인정보를 처리하며, 목적이 변경되는 경우 별도의 동의를 받습니다.</p>
          <ol>
            <li>회원 가입 및 관리: 회원제 서비스 제공, 본인 확인(휴대전화 인증), 회원 자격 유지·관리</li>
            <li>주보 알림 문자 발송: 수신에 동의한 회원에게 주보 안내 문자 발송</li>
            <li>온라인 헌금: 헌금 결제 처리 및 결제 내역 관리</li>
          </ol>
        </section>

        <section className="hc-privacy-section">
          <h2>제2조 (처리하는 개인정보의 항목)</h2>
          <table className="hc-privacy-table">
            <thead>
              <tr><th>구분</th><th>항목</th></tr>
            </thead>
            <tbody>
              <tr><td>회원가입 (필수)</td><td>이름, 생년월일, 휴대전화번호, 아이디, 비밀번호</td></tr>
              <tr><td>주보 문자 수신 (선택)</td><td>수신 동의 여부 및 변경 일시</td></tr>
              <tr><td>온라인 헌금</td><td>헌금자명(선택 입력), 헌금 금액, 주문번호, 결제 승인 정보, 결제 일시</td></tr>
              <tr><td>자동 수집</td><td>접속 IP 주소, 서비스 이용 기록</td></tr>
            </tbody>
          </table>
          <p className="hc-privacy-note">
            ※ 카드번호 등 결제수단 정보는 결제대행사(토스페이먼츠)가 직접 처리하며 교회는 저장하지 않습니다.
            <br />※ 교회는 만 14세 미만 아동의 회원가입을 받지 않습니다.
          </p>
        </section>

        <section className="hc-privacy-section">
          <h2>제3조 (개인정보의 처리 및 보유 기간)</h2>
          <ol>
            <li>회원 정보: 회원 탈퇴 시까지 (탈퇴 즉시 파기)</li>
            <li>휴대전화 인증번호: 인증 완료 또는 유효시간 만료 시까지</li>
            <li>헌금 기록: <Pending value={OFFERING_RETENTION} /></li>
          </ol>
        </section>

        <section className="hc-privacy-section">
          <h2>제4조 (개인정보의 파기 절차 및 방법)</h2>
          <p>
            교회는 보유 기간이 지나거나 처리 목적이 달성된 개인정보를 지체 없이 파기합니다.
            전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제합니다.
          </p>
        </section>

        <section className="hc-privacy-section">
          <h2>제5조 (개인정보의 제3자 제공)</h2>
          <p>교회는 정보주체의 동의 또는 법률의 특별한 규정이 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.</p>
        </section>

        <section className="hc-privacy-section">
          <h2>제6조 (개인정보 처리의 위탁)</h2>
          <p>교회는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
          <table className="hc-privacy-table">
            <thead>
              <tr><th>수탁자</th><th>위탁 업무</th></tr>
            </thead>
            <tbody>
              <tr><td>(주)누리고 (CoolSMS)</td><td>휴대전화 인증번호 및 주보 알림 문자 발송</td></tr>
              <tr><td>토스페이먼츠(주)</td><td>온라인 헌금 결제 처리</td></tr>
              <tr><td>Amazon Web Services, Inc.</td><td>서버 및 데이터베이스 운영(데이터 보관)</td></tr>
            </tbody>
          </table>
        </section>

        <section className="hc-privacy-section">
          <h2>제7조 (개인정보의 국외 이전)</h2>
          <p>교회는 서비스 운영을 위해 다음과 같이 개인정보를 국외에 보관합니다.</p>
          <table className="hc-privacy-table">
            <tbody>
              <tr><th>이전받는 자</th><td>Amazon Web Services, Inc.</td></tr>
              <tr><th>이전 국가</th><td>호주 (AWS 시드니 리전)</td></tr>
              <tr><th>이전 항목</th><td>제2조의 개인정보 전체</td></tr>
              <tr><th>이전 일시 및 방법</th><td>서비스 이용 시점에 네트워크를 통해 전송</td></tr>
              <tr><th>이전 목적</th><td>서버 및 데이터베이스 운영(데이터 보관)</td></tr>
              <tr><th>보유 및 이용 기간</th><td>제3조의 보유 기간과 같음</td></tr>
            </tbody>
          </table>
          <p className="hc-privacy-note">
            ※ 국외 이전을 원하지 않으시면 회원가입을 하지 않거나 탈퇴하실 수 있습니다. 다만 이 경우 회원 서비스 이용이 제한됩니다.
          </p>
        </section>

        <section className="hc-privacy-section">
          <h2>제8조 (정보주체의 권리·의무 및 행사 방법)</h2>
          <p>
            정보주체는 언제든지 개인정보 열람·정정·삭제·처리정지를 요구할 수 있습니다.
            주보 문자 수신 동의는 마이페이지에서 직접 변경할 수 있으며, 그 밖의 요청은
            아래 개인정보 보호책임자에게 연락하시면 지체 없이 조치하겠습니다.
          </p>
        </section>

        <section className="hc-privacy-section">
          <h2>제9조 (개인정보의 안전성 확보 조치)</h2>
          <ol>
            <li>비밀번호 암호화 저장</li>
            <li>전 구간 HTTPS 암호화 통신</li>
            <li>관리자 계정 분리 및 접근 권한 제한</li>
            <li>인증문자 발송 횟수 제한 등 비정상 접근 차단</li>
          </ol>
        </section>

        <section className="hc-privacy-section">
          <h2>제10조 (자동 수집 장치의 설치·운영 및 거부)</h2>
          <p>
            교회 홈페이지는 쿠키를 사용하지 않습니다. 로그인 상태 유지를 위한 정보는 이용자 브라우저의
            저장소에만 보관되며, 로그아웃 시 삭제됩니다.
          </p>
        </section>

        <section className="hc-privacy-section">
          <h2>제11조 (개인정보 보호책임자)</h2>
          <table className="hc-privacy-table">
            <tbody>
              <tr><th>직책</th><td>{MANAGER.position}</td></tr>
              <tr><th>성명</th><td><Pending value={MANAGER.name} /></td></tr>
              <tr><th>연락처</th><td>{MANAGER.phone}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="hc-privacy-section">
          <h2>제12조 (권익침해 구제 방법)</h2>
          <p>개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.</p>
          <ul>
            <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청: 1301 (www.spo.go.kr)</li>
            <li>경찰청: 182 (ecrm.police.go.kr)</li>
          </ul>
        </section>

        <section className="hc-privacy-section">
          <h2>제13조 (개인정보처리방침의 변경)</h2>
          <p>이 개인정보처리방침은 <Pending value={EFFECTIVE_DATE} label="시행일 미정" />부터 적용됩니다.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
