import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1B5DEF",
          navy: "#000A3A",
          periwinkle: "#7489FF",
          indigo: "#384EC7",
        },
        success: {
          DEFAULT: "#0C9D61",
          bg: "#F2FAF6",
        },
        warning: {
          text: "#FFC82C",
          border: "#E9B406",
        },
        danger: {
          DEFAULT: "#FF7F7F",
          bg: "#FFFBFB",
        },
        teal: {
          accent: "#2AB7A9",
        },
        surface: {
          gray: "#FAFAFA",
          blue: "#F8FAFF",
        },
        border: {
          light: "#E5E7EB",
          mid: "#9CA3AF",
        },
        icon: {
          gray: "#6B7180",
        },
        text: {
          secondary: "#374151",
          tertiary: "#9CA3AF",
          disabled: "#D1D5DB",
        },
        tint: {
          blue: "#97BCF0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        "section-title": ["20px", { lineHeight: "1.5", fontWeight: "600" }],
        "body-emphasis": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "small-label": ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        "small-body": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption-medium": ["12px", { lineHeight: "1.5", fontWeight: "500" }],
        "badge-text": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "admin-label": ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        xs: "2px",
        sm: "5px",
        md: "8px",
        base10: "10px",
        lg: "15px",
        xl: "20px",
        "2xl": "30px",
      },
      borderRadius: {
        DEFAULT: "8px",
        pill: "12px",
        avatar: "100px",
        bell: "24px",
        scrollbar: "200px",
      },
      borderWidth: {
        hairline: "0.5px",
      },
      width: {
        canvas: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
