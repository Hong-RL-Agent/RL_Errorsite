import "../styles/globals.css";

export const metadata = {
  title: "ThreadGarden",
  description: "B-08 community validation site"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
