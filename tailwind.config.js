/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-green-light': '#1ed760',
        'spotify-dark': '#121212',
        'spotify-light-black': '#282828',
        'spotify-gray': '#b3b3b3',
      },
    },
  },
  plugins: [],
} 