import './globals.css';

export const metadata = {
  title: 'OrderPilot - 이커머스 통합 주문 및 배송 관리 시스템',
  description: '온라인 쇼핑몰 운영자를 위한 실시간 주문/배송/결제 관리 백오피스',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
