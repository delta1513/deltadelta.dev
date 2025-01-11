/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'page-bg-start': '#330b60',
        'page-bg': '#130d17',
        'neon-green': '#39FF14',
        'neon-green-accent': '#69fcbc',
        'button-purple': '#251244',
        'button-purple-hover': '#32195d'
      },
      boxShadow: {
        'inner-even': '0px 0px 25px inset',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      },
      animation: {
        blink: 'blink 1s step-end infinite'
      }
    },
    fontFamily: {
      'jockey': ['"Jockey One"', 'sans-serif'],
      'rubik': ['Rubik', 'sans-serif'],
    },
  },
  plugins: [],
}

