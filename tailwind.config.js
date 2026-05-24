/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./main.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        brand: {
          base:     '#080608',
          surface:  '#100C14',
          surface2: '#16101D',
          accent:   '#C8922A',
        },
        text:  '#F2EFE8',
        muted: '#9A9290',
      }
    }
  },
  plugins: [],
}
