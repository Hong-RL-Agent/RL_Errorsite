import "../styles/globals.css";

export const metadata = {
  title: "AccountFlow",
  description: "B-06 account management training site"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
