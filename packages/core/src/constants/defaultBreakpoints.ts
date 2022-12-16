import { DefaultBreakpointsEnum } from '@pragma-web-utils/types/src/enums/DefaultBreakpointsEnum'
import { createTheme } from 'styled-breakpoints'

export const defaultBreakpoints = createTheme<Record<DefaultBreakpointsEnum, string>>({
  xs: '360px',
  sm: '500px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
})
