/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        xendly: {
          primary: '#10B981',
          accent: '#34D399',
          'bg-light': '#D1FAE5',
          'bg-dark': '#0F172A',
          'grid-light': '#A7F3D0',
          'grid-dark': '#10B981',
        }
      },
      fontFamily: {
        'inter': ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold'],
      },
    },
  },
  plugins: [],
}