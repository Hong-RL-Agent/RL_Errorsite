import './globals.css';

export const metadata = {
  title: 'EventWave | 글로벌 행사 및 컨퍼런스 참가 신청 플랫폼',
  description: '최신 테크, 디자인, 비즈니스 컨퍼런스 탐색 및 원클릭 티켓팅 플랫폼'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
