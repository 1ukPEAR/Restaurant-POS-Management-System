/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#3498db",
        secondary: "#FFFFFF",
        bg: "#E0E0E0",
        text: "#000000",
        tableHeader: "#EeEeEe",
        iconDark: "#5B5B5B",
        iconLight: "#ACACAC",
        button: "#196BA2",
        success: "#27ae60",
        warning: "#FF742F",
        error: "#EE1313",
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],     // front thai
      },
      fontSize: {
        h0: ['64px', { lineHeight: '72px', fontWeight: '700' }],
        h1: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        h2: ['34px', { lineHeight: '42px', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h4: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        base: ['16px', { lineHeight: '24px' }],
      },
      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,0.08)',
        button: '0 2px 8px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'lg': '12px',
      },
    },
  },
  plugins: [
  
  ],
}
