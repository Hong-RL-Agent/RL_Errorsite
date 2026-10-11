import "../styles/globals.css";

export const metadata = {
  title: "CineWave",
  description: "B-04 movie booking training site"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
