import './globals.css';

export const metadata = {
  title: 'BookNest - 도서관 장서 및 대출 관리 시스템',
  description: '체계적인 도서 등록, 실시간 대출/반납 현황, 서가 위치 및 이용자 관리 시스템',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
