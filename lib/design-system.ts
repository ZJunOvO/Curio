/**
 * Curio Design System
 * Based on Apple Human Interface Guidelines
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
  },
  
  // Gray Scale
  gray: {
    50: '#F2F2F7',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#AEAEB2',
    500: '#8E8E93',
    600: '#636366',
    700: '#48484A',
    800: '#3A3A3C',
    900: '#2C2C2E',
    950: '#1C1C1E',
  },
  
  // Semantic Colors
  semantic: {
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    info: '#007AFF',
  },
  
  // Dark Mode Variants
  dark: {
    blue: '#0A84FF',
    green: '#32D74B',
    indigo: '#5E5CE6',
    orange: '#FF9F0A',
    pink: '#FF375F',
    purple: '#BF5AF2',
    red: '#FF453A',
    teal: '#64D2FF',
    yellow: '#FFD60A',
  },
};

// Typography Scale
export const typography = {
  // Font Families
  fontFamily: {
    display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    mono: 'SF Mono, Monaco, "Courier New", monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.75rem', // 28px
    '4xl': '2rem',    // 32px
    '5xl': '2.5rem',  // 40px
    '6xl': '3rem',    // 48px
  },
  
  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};

// Spacing Scale
export const spacing = {
  '0': '0px',
  'px': '1px',
  '0.5': '0.125rem', // 2px
  '1': '0.25rem',    // 4px
  '2': '0.5rem',     // 8px
  '3': '0.75rem',    // 12px
  '4': '1rem',       // 16px
  '5': '1.25rem',    // 20px
  '6': '1.5rem',     // 24px
  '8': '2rem',       // 32px
  '10': '2.5rem',    // 40px
  '12': '3rem',      // 48px
  '16': '4rem',      // 64px
  '20': '5rem',      // 80px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.375rem',    // 6px
  base: '0.625rem',  // 10px - Apple standard
  md: '0.875rem',    // 14px
  lg: '1.25rem',     // 20px
  xl: '1.875rem',    // 30px
  full: '9999px',
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
  base: '0 4px 16px rgba(0, 0, 0, 0.08)',
  md: '0 6px 24px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.16)',
  '2xl': '0 16px 64px rgba(0, 0, 0, 0.2)',
};

// Animation
export const animation = {
  // Durations
  duration: {
    instant: '0ms',
    fast: '200ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  // Easing Functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    apple: 'cubic-bezier(0.16, 1, 0.3, 1)', // Apple's signature easing
  },
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Icon Sizes
export const iconSize = {
  xs: '16px',
  sm: '20px',
  base: '24px',
  lg: '28px',
  xl: '32px',
}; 