/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ski: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#38bdf8',
          snow: '#f8fafc',
          powder: '#06b6d4',
          gold: '#f59e0b',
          danger: '#ef4444',
          good: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
