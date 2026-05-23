/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#050505",
        panel: "#0b0f1a",
        neon: "#31f2ff",
        magenta: "#c084fc"
      },
      boxShadow: {
        glow: "0 0 30px rgba(49, 242, 255, 0.12)"
      }
    }
  },
  plugins: []
};

