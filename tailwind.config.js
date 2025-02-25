/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js,njk}",
    "./_now/**/*.{html,js,njk,md}",
    "./now/**/*.{html,js,njk}",
    "./_blog/**/*.{html,js,njk,md}",
    "./blog/**/*.{html,js,njk}"
  ],
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
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#D1D5DB',
            a: {
              color: '#39FF14',
              '&:hover': {
                color: '#69fcbc',
              },
            },
            h1: {
              color: '#39FF14',
            },
            h2: {
              color: '#39FF14',
            },
            h3: {
              color: '#39FF14',
            },
            strong: {
              color: '#39FF14',
            },
            code: {
              color: '#39FF14',
            },
            blockquote: {
              borderLeftColor: '#39FF14',
              color: '#D1D5DB',
            },
          },
        },
      },
    },
    fontFamily: {
      'jockey': ['"Jockey One"', 'sans-serif'],
      'rubik': ['Rubik', 'sans-serif'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

