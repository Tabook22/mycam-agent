export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        base:    "#09090e",
        surface: "#111118",
        s2:      "#17171f",
        s3:      "#1e1e2a",
        brand:   "#7c3aed",
      },
      boxShadow: {
        "glow-violet": "0 0 24px rgba(124,58,237,0.35)",
        "glow-green":  "0 0 16px rgba(16,185,129,0.40)",
        "glow-blue":   "0 0 16px rgba(59,130,246,0.35)",
        "glow-amber":  "0 0 16px rgba(245,158,11,0.35)",
      },
    },
  },
  plugins: [],
};
