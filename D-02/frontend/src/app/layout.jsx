import './globals.css';

export const metadata = {
  title: 'PennyLog - 스마트 개인 가계부 & 자산 관리',
  description: '체계적인 수입/지출 관리, 월별 예산 통제 및 금융 자산 통합 대시보드',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
