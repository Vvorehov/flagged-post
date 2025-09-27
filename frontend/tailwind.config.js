/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#667eea', 
          600: '#5a67d8',
          700: '#4c51bf',
        }
      }
    },
  },
  plugins: [],
}