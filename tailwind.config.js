/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors:
    {
      bg: '#f4f1f4',
      white: '#faf9fa',
      gray: {
        100: '#36353b',
        200: '#646369',
        300: '#9a98a0',
        400: '#d0ced4',
        500: '#e8e7e9',
      },
      tweet: {
        accent: '#d9e3f5',
        base: '#82a2df',
        emph: '#2d4d8a'
      },
      collection: {
        accent: '#d9def5',
        base: '#8290df',
        emph: '#2d3b8a'
      },
      author: {
        base: '#96e4d1',
        emph: '#166552',
        accent: '#d5f4ed'
      },
      community: {
        base: '#d0e496',
        emph: '#36430f',
        accent: '#ecf4d5'
      },
      entity: {
        base: '#fded5a',
        emph: '#544c03',
        accent: '#feface'
      },
      media: {
        base: '#e4c798',
        emph: '#281d0a',
        accent: '#f4e9d6'
      },

    },
    fontSize:
    {
      "2xs": "0.5rem",
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.25rem",
      "xl": "1.5rem"
    },
    fontFamily: { 
      sans: ['Inter', "Segoe UI", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      display: ['GT Pressura Trial', "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
    },
    boxShadow:
    {
      'focus': '0px 36px 42px -4px rgba(77,77,77,0.15)',
      'subdue': '0px 6px 52px -8px rgba(228,222,222,1)'
    },
    borderRadius:
    {
      none: '0',
      xs: '0.25rem',
      sm: '0.3rem',
      DEFAULT: '0.375',
      md: '0.75rem',
      lg: '2rem',
      full: '9999px'
    },
    letterSpacing:
    {
      tightest: '-0.03em',
      tighter: '-0.025em',
      tight: '-0.015',
      normal: '-0.005',
      wide: '0.025em',
      wider: '0.125em',
    },
    extend: {
      opacity: {
        35: '0.35',
        55: '0.55',
      },
      spacing: {
        "4.5": '1.125rem',
      },
    }
  },
  plugins: [],
}
