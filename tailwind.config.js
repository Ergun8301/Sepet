/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tilkapp-green': '#39e3cf',
        'tilkapp-beige': '#ffffff',
        'tilkapp-orange': '#e2fd66',
        'kapkurtar-verdigris': '#39e3cf',
        'kapkurtar-teal': '#545454',
        'kapkurtar-orange': '#e2fd66',
        'kapkurtar-cream': '#ffffff',
        'kapkurtar-turquoise': '#39e3cf',
        'kapkurtar-yellow': '#e2fd66',
        'kapkurtar-green': '#51a598',
        'kapkurtar-gray': '#545454',
      }
    },
  },
  plugins: [],
};