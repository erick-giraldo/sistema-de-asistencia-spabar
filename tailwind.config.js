/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spa: {
          bg: "#24262A",
          raised: "#2B2D32",
          line: "#393B40",
          track: "#3A3D42",
          strong: "#4A4D52",
          field: "#63666B",
          hover: "#7E8186",
          faint: "#94979B",
          muted: "#B8BABD",
          text: "#F4F4F2",
          accent: "#66F0DC",
          alert: "#FFC2B3",
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      keyframes: {
        "spabar-spin": { to: { transform: "rotate(360deg)" } },
        "spabar-breathe": {
          "0%, 100%": { transform: "scale(0.985)", opacity: "0.92" },
          "50%": { transform: "scale(1.02)", opacity: "1" },
        },

        // 👇 nuevo: “pintado” de abajo hacia arriba (crece la altura)
        "spabar-fill-up": {
          from: { height: "0%" },
          to: { height: "100%" },
        },
      },
      animation: {
        "spabar-spin": "spabar-spin 1.05s linear infinite",
        "spabar-breathe": "spabar-breathe 1.6s ease-in-out infinite",

        // 👇 nuevo (forwards para que se quede “pintado”)
        "spabar-fill": "spabar-fill-up 1.2s ease-out forwards",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".spabar-ring-mask": {
          "-webkit-mask":
            "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 10px))",
          mask:
            "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 10px))",
        },
      });
    }),
  ],
};
