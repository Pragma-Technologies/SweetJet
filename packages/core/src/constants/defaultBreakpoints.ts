import { createTheme } from 'styled-breakpoints'
import { DefaultBreakpointsEnum } from '../enums'

export const defaultBreakpoints = createTheme<Record<DefaultBreakpointsEnum, string>>({
  [DefaultBreakpointsEnum.SIZE_XS_360]: '360px',
  [DefaultBreakpointsEnum.SIZE_SM_500]: '500px',
  [DefaultBreakpointsEnum.SIZE_MD_768]: '768px',
  [DefaultBreakpointsEnum.SIZE_LG_992]: '992px',
  [DefaultBreakpointsEnum.SIZE_XL_1200]: '1200px',
  [DefaultBreakpointsEnum.SIZE_XXL_1400]: '1400px',
})
