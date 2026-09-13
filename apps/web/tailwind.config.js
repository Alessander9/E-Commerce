/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6A2CFF", // Morado Principal
          hover: "#5720E5",
          light: "#F3E8FF",
          soft: "#FAF5FF",
          purpleLight: "#8E5BFF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1976FF", // Azul Eléctrico
          hover: "#125BD4",
          light: "#EFF6FF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#00B8C9", // Turquesa
          soft: "#E6FAFC",
          foreground: "#0D1B3D",
        },
        navy: {
          DEFAULT: "#0D1B3D", // Azul Marino
          dark: "#081026",
          light: "#172A59",
        },
        muted: {
          DEFAULT: "#F7F8FC",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2C",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#0EA5E9",
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #6A2CFF 0%, #1976FF 100%)',
        'grad-primary-hover': 'linear-gradient(135deg, #5720E5 0%, #125BD4 100%)',
        'grad-secondary': 'linear-gradient(135deg, #8E5BFF 0%, #D946EF 100%)',
        'grad-accent': 'linear-gradient(135deg, #00B8C9 0%, #1976FF 100%)',
      },
      boxShadow: {
        'glow-primary': '0 8px 24px rgba(106, 44, 255, 0.25)',
        'glow-secondary': '0 8px 24px rgba(25, 118, 255, 0.25)',
        'card-hover': '0 20px 30px -6px rgba(106, 44, 255, 0.12), 0 10px 16px -6px rgba(25, 118, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
