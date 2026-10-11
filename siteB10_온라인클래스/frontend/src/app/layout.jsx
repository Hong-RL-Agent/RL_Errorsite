import "../styles/globals.css";

export const metadata = {
  title: "SkillOrbit",
  description: "B-10 online class unseen test site"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
