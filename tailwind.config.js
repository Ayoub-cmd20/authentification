/** @type {import('tailwindcss').Config} */
export default {
  content: ["./apps/web/index.html", "./apps/web/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        civic: "#0f766e",
        navy: "#1f3a5f",
        gold: "#b7791f",
        paper: "#f7faf9"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(16, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};
