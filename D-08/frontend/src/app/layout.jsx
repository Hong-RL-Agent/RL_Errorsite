import './globals.css';

export const metadata = {
  title: 'TeamOrbit - 팀 업무 협업 및 칸반 보드 플랫폼',
  description: '팀 스페이스, 칸반 보드, 활동 타임라인을 갖춘 팀 업무 협업 솔루션',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
