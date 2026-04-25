/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./main.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          base: '#0B0710',     
          surface: '#160D1C',  
          accent: '#8B5CF6'    
        },
        text: '#F8F7FA',      
        muted: '#A59EAD',      
      }
    }
  },
  plugins: [],
}