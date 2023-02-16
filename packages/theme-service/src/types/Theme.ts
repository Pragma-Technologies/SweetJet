export type ThemeName = 'light' | 'dark'
export type Themed<T> = { [key in ThemeName]: T }

export type CssColorVarKeys<T extends string> = `--${T}`
export type CssColorVarValues<T extends string> = `var(--${T})`

export type ColorConstant<T extends string> = { [key in T]: string }
export type CssColorVars<T extends string> = { [key in CssColorVarKeys<T>]: string }
export type CssColorConstant<T extends string> = { [key in T]: CssColorVarValues<key> }

export interface IThemeContext<
  A extends Record<string, string>,
  B extends unknown | undefined,
  C extends unknown | undefined,
> {
  themeName: ThemeName

  setTheme(themeName: ThemeName): void

  toggleTheme(): void

  colors: A

  images: B

  icons: C
}
