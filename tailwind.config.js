export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.08)',
        glow: '0 20px 50px rgba(16, 185, 129, 0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        navy: {
          500: '#1e3a5f',
          600: '#16374d',
          700: '#122f45',
        },
      },
    },
  },
  plugins: [],
};
