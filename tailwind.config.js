/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'festive-orange': '#FF7043',
        'vibrant-purple': '#7B1FA2',
        'sky-blue': '#4FC3F7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
      }
    },
  },
  plugins: [],
}
