/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: "#000000",
          card: "#1C1C1E",
          cardElevated: "#2C2C2E",
          separator: "#38383A",
          blue: "#0A84FF",
          purple: "#BF5AF2",
          indigo: "#5E5CE6",
          red: "#FF453A",
          orange: "#FF9F0A",
          green: "#30D158",
          teal: "#64D2FF",
          yellow: "#FFD60A"
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'ios-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'ios-glow': '0 0 25px -5px rgba(10, 132, 255, 0.3)'
      }
    },
  },
  plugins: [],
}
