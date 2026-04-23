export const lightTokens = {
  colors: {
    background: '#f5f3ee',
    surface:    '#ece9e2',
    accent:     '#b87a5a',
    text:       '#1c1917',
    muted:      '#9a9690',
  },
  fonts: {
    display: '"Playfair Display", serif',
    body:    '"DM Sans", sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  spacing: {
    slideX: '4rem',
    slideY: '3rem',
  },
} as const

export const darkTokens = {
  colors: {
    background: '#0F0F0F',
    surface:    '#1A1A1A',
    accent:     '#6EE7B7',
    text:       '#F5F5F5',
    muted:      '#888888',
  },
  fonts: {
    display: '"Playfair Display", serif',
    body:    '"DM Sans", sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  spacing: {
    slideX: '4rem',
    slideY: '3rem',
  },
} as const

// Default export — used by tailwind.config.ts for build-time static values
export const tokens = lightTokens
