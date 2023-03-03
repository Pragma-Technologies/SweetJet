import { FunctionComponent, SVGProps } from 'react'

export type CssColorVarKeys<T extends string> = `--${T}`
export type CssColorVarValues<T extends string> = `var(--${T})`

export type ColorConstant<T extends string> = { [key in T]: string }
export type CssColorVars<T extends string> = { [key in CssColorVarKeys<T>]: string }
export type CssColorConstant<T extends string> = { [key in T]: CssColorVarValues<key> }

export type Themed<ThemeNames extends string, T> = { [key in ThemeNames]: T }

export type ThemeConfig<
  ThemeNames extends string,
  ColorNames extends string,
  ThemedIcons extends Record<string, unknown> | undefined,
  ThemedImages extends Record<string, unknown> | undefined,
> = {
  [key in ThemeNames]: {
    colors: ColorConstant<ColorNames>
    icons: ThemedIcons
    images: ThemedImages
  }
}

export interface ThemeContextProps<ThemeNames extends string> {
  children: React.ReactNode
  defaultTheme?: ThemeNames
}

export type svgType = FunctionComponent<SVGProps<SVGSVGElement> & { title?: string | undefined }>

export interface ThemeContextType<
  ThemeNames extends string,
  Colors extends string,
  ThemedIcons extends Record<string, unknown> | undefined,
  ThemedImages extends Record<string, unknown> | undefined,
> {
  themeName: ThemeNames

  themeConfig: ThemeConfig<ThemeNames, Colors, ThemedIcons, ThemedImages>[ThemeNames]

  setTheme(themeName: ThemeNames): void
}
