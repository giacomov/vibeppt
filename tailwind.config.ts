import type { Config } from 'tailwindcss'
import { tokens } from './src/theme/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './presentations/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'slide-text': 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        'slide-x': tokens.spacing.slideX,
        'slide-y': tokens.spacing.slideY,
      },
      aspectRatio: {
        slide: '16 / 9',
      },
      keyframes: {
        'flap-top-out': {
          '0%':   { transform: 'rotateX(0deg)',   opacity: '1' },
          '100%': { transform: 'rotateX(-90deg)', opacity: '0.4' },
        },
        'flap-bottom-in': {
          '0%':   { transform: 'rotateX(90deg)',  opacity: '0.4' },
          '100%': { transform: 'rotateX(0deg)',   opacity: '1' },
        },
        'card-flip': {
          '0%':   { opacity: '0', transform: 'rotateY(180deg)' },
          '100%': { opacity: '1', transform: 'rotateY(0deg)' },
        },
        'hammer-drop': {
          '0%':   { transform: 'translateY(-110vh)', opacity: '0' },
          '55%':  { transform: 'translateY(18px)',   opacity: '1' },
          '70%':  { transform: 'translateY(-9px)' },
          '83%':  { transform: 'translateY(5px)' },
          '92%':  { transform: 'translateY(-2px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'impact-ring': {
          '0%':   { transform: 'scale(0.15)', opacity: '1' },
          '100%': { transform: 'scale(4)',    opacity: '0' },
        },
        'accent-bar': {
          '0%':   { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'takeaway-glow': {
          '0%':   { opacity: '0.13' },
          '60%':  { opacity: '1', textShadow: '0 0 60px rgba(110,231,183,0.25)' },
          '100%': { opacity: '1', textShadow: '0 0 0px rgba(110,231,183,0)' },
        },
        'letter-rise': {
          '0%':   { opacity: '0', transform: 'translateY(36px)' },
          '65%':  { opacity: '1', transform: 'translateY(-7px)' },
          '82%':  { transform: 'translateY(3px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'line-expand': {
          '0%':   { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'subtitle-rise': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'flap-top-out':   'flap-top-out 80ms ease-in forwards',
        'flap-bottom-in': 'flap-bottom-in 80ms ease-out forwards',
        'card-flip':      'card-flip 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) both',
        'hammer-drop':    'hammer-drop 0.7s ease-in forwards',
        'impact-ring':    'impact-ring 0.55s ease-out forwards',
        'accent-bar':     'accent-bar 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'takeaway-glow':  'takeaway-glow 0.8s ease-out forwards',
        'letter-rise':    'letter-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up':        'fade-up 0.6s ease-out both',
        'line-expand':    'line-expand 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'subtitle-rise':  'subtitle-rise 0.6s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
