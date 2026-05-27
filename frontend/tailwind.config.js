/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        status: {
          pass: '#22c55e',
          fail: '#ef4444',
          blocked: '#eab308',
          progress: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};
