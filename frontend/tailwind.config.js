export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Outfit", "Inter", "sans-serif"] },
      colors: {
        bg: "#0f0f1a",
        panel: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0, transform: "translateY(6px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: {
        fadeIn: "fadeIn .4s ease-out both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
