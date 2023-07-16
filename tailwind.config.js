/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {

    extend: {
      keyframes: {
        top: {
          '0%': {
            opacity: 0,
            transform: 'translateY(-500px)',
          },
          '100%': {
            opacity: 1, 
            transform: 'translateX(0)',
          },
        },

        load: {
          '0%': {
            opacity: 0,
            transform: 'scale(0.8)',
          },
          '100%': {
            opacity: 1, 
            transform: 'scale(1)',
          },
        }

      },

      animation: {
        top: 'top .2s ease 0s 1 normal forwards',
        load: 'load .2s ease 0s 1 normal forwards',
      }
    },
  },
  plugins: [],
}
