import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        creme: {
          50: "#FCFAF7",
          100: "#FAF7F2",
          200: "#F3EFEA",
          300: "#EAE3DA",
          DEFAULT: "#FAF7F2",
        },
        terracotta: {
          light: "#FDF4F0",
          soft: "#F8DDD2",
          DEFAULT: "#D96B43",
          hover: "#E27953",
          dark: "#B54D27",
        },
        honey: {
          light: "#FEF7EB",
          soft: "#FCE5BC",
          DEFAULT: "#E8A317",
          hover: "#F3B026",
          dark: "#C47D0B",
        },
        sage: {
          light: "#EDF7F2",
          soft: "#D1ECDC",
          DEFAULT: "#2F8F62",
          hover: "#399F70",
          dark: "#1E6B47",
        },
        lagon: {
          light: "#EFF7FA",
          soft: "#D4EBF3",
          DEFAULT: "#3B8AA8",
          hover: "#4A9BB9",
          dark: "#286A85",
        },
        coral: {
          light: "#FDF2F0",
          soft: "#F9D5D1",
          DEFAULT: "#DC5D52",
          hover: "#E66D63",
          dark: "#B83E34",
        },
        clay: {
          DEFAULT: "#2C2623",
          muted: "#756B64",
          subtle: "#A3978E",
          border: "#E8E0D5",
          darkborder: "#D6CABE",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Plus Jakarta Sans", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(112, 87, 60, 0.07), 0 4px 12px -2px rgba(112, 87, 60, 0.04)',
        'soft-lg': '0 20px 40px -10px rgba(112, 87, 60, 0.1), 0 8px 16px -4px rgba(112, 87, 60, 0.05)',
        'plateau': '0 25px 50px -12px rgba(92, 70, 48, 0.15), 0 0 0 1px rgba(216, 203, 189, 0.5)',
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
