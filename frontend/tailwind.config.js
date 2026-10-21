/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1e2024',
          header: '#212529',
          border: '#e2e8f0',
          primary: '#1d4ed8',
          danger: '#dc2626',
          warning: '#f59e0b',
          success: '#16a34a',
          burgundy: '#a83232',
        },
      },
    },
  },
  plugins: [],
}
