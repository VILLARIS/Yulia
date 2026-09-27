/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102133',
        navy: '#0f2942',
        action: '#1769aa',
        'action-strong': '#12558c',
        canvas: '#f4f7fa',
        success: '#287a58',
        warning: '#a46312',
        // Azul muy claro para superficies y fondos suaves.
        surface: '#eaf2fb',
        // Verde de marca. `brand` es decorativo y `brand-ink` mantiene el
        // contraste suficiente para texto pequeño sobre blanco (5.3:1).
        brand: '#2f9e63',
        'brand-ink': '#1c7a4e',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 41, 66, 0.06), 0 10px 30px rgba(15, 41, 66, 0.05)',
      },
      borderRadius: {
        panel: '0.875rem',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

