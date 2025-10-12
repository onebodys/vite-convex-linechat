export const lineBrand = {
  primary: "#06C755",
  primaryStrong: "#048B3B",
  primaryTint: "#E6F9EE",
  secondary: "#38D277",
  secondaryTint: "#5DDB91",
  accent: "#05A948",
  accentTint: "#9BE9BB",
  neutralForeground: "#072A18",
  neutralForegroundInverted: "#E6F9EE",
} as const;

export const gradients = {
  primary: "linear-gradient(135deg, #06C755 0%, #38D277 100%)",
  accent: "linear-gradient(135deg, #048B3B 0%, #5DDB91 100%)",
  primaryDark: "linear-gradient(135deg, #048B3B 0%, #06C755 100%)",
  accentDark: "linear-gradient(135deg, #033915 0%, #05A948 100%)",
} as const;

export const schemes = {
  light: {
    background: "#F3FCF7",
    foreground: lineBrand.neutralForeground,
    card: "#FFFFFF",
    cardForeground: lineBrand.neutralForeground,
    primary: lineBrand.primary,
    primaryForeground: "#FFFFFF",
    secondary: lineBrand.secondary,
    secondaryForeground: "#033915",
    accent: lineBrand.secondaryTint,
    accentForeground: "#033915",
    muted: lineBrand.primaryTint,
    mutedForeground: "#3E6650",
    border: "#C1F1D5",
    ring: lineBrand.primary,
  },
  dark: {
    background: "#04170B",
    foreground: lineBrand.neutralForegroundInverted,
    card: "#062012",
    cardForeground: lineBrand.neutralForegroundInverted,
    primary: lineBrand.secondary,
    primaryForeground: "#04170B",
    secondary: lineBrand.primaryStrong,
    secondaryForeground: "#DDF7E6",
    accent: lineBrand.accent,
    accentForeground: "#04170B",
    muted: "#0F2618",
    mutedForeground: "#8FDCA9",
    border: "#11311D",
    ring: lineBrand.secondary,
  },
} as const;

export type ColorSchemeName = keyof typeof schemes;

export type ColorScheme = (typeof schemes)[ColorSchemeName];
