export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        brand: "#7c3aed",
        "brand-dark": "#5b21b6",
        "brand-light": "#8b5cf6",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-brand": "0 0 20px rgba(124, 58, 237, 0.3)",
        "glow-green": "0 0 20px rgba(5, 150, 105, 0.25)",
        "glow-blue": "0 0 20px rgba(37, 99, 235, 0.25)",
        "card-hover": "0 4px 16px rgba(15, 23, 42, 0.12), 0 12px 40px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
