/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#0056b3',
            dark: '#2563eb',
            foreground: '#ffffff',
            'foreground-dark': '#ffffff',
          },
          secondary: {
            DEFAULT: '#6c757d',
            foreground: '#ffffff',
          },
          destructive: {
            DEFAULT: '#dc2626',
            foreground: '#ffffff',
          },
          muted: {
            DEFAULT: '#f3f4f6',
            foreground: '#6b7280',
          },
          accent: {
            DEFAULT: '#f9fafb',
            foreground: '#111827',
          },
          background: {
            DEFAULT: '#ffffff',
            dark: '#111827',
          },
          border: "hsl(var(--border))",
        },
        borderColor: {
          DEFAULT: "hsl(var(--border))",
        },
      },
    },
    plugins: [],
  }