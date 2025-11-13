/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tilkapp-green': '#00615f',
        'tilkapp-beige': '#f3eace',
        'tilkapp-orange': '#f75c00',
        'tilkapp-black': '#000000',
        'tilkapp-white': '#ffffff',
      }
    },
  },
  plugins: [],
};