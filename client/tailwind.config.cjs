/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@radix-ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  prefix: "",
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        cyber: {
          'midnight': '#0a0e27',
          'dark': '#1a1f3a',
          'blue': '#2d3561',
          'purple': '#8b5cf6',
          'electric-purple': '#a855f7',
          'cyan': '#06b6d4',
          'neon-cyan': '#22d3ee',
          'glass': 'rgba(255, 255, 255, 0.05)',
          'glass-border': 'rgba(255, 255, 255, 0.1)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-neon': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'holographic-gradient': 'linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4)',
        'neural-pattern': 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        'cyber-grid': 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon': '0 0 20px rgba(139, 92, 246, 0.5)',
        'cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow': '0 0 30px rgba(168, 85, 247, 0.6)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'holographic': 'holographic 3s linear infinite',
        'particle': 'particle 8s ease-in-out infinite',
        'neural': 'neural 5s ease-in-out infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'matrix': 'matrix 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        holographic: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        particle: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translateY(-50px) scale(1.2)', opacity: '0.6' },
        },
        neural: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.5' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        matrix: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
        'holographic': '200% 200%',
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
}
