/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        }
      },
      backgroundImage: {
        'gradient-zen': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }
    },
  },
  plugins: [],
}