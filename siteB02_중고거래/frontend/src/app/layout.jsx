import "../styles/globals.css";

export const metadata = {
  title: "ReMarket",
  description: "B-02 secondhand marketplace training site"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
