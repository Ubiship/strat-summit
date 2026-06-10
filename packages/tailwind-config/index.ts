// Re-export the theme CSS path for apps to import
export const themePath = '@repo/tailwind-config/theme.css';

// Brand color values for programmatic use
export const brandColors = {
  forest: '#1b4332',
  stone: '#d4c5b5',
  cream: '#fafaf8',
  charcoal: '#2d2d2d',
  gold: '#c9882a',
  goldDark: '#a87220',
  goldLight: '#e8a032',
  copper: '#c9882a',
} as const;

export type BrandColor = keyof typeof brandColors;
