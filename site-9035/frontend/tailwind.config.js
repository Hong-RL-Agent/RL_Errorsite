/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#0e1625",
        border: "#1f2937"
      },
      boxShadow: {
        card: "0 12px 30px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
