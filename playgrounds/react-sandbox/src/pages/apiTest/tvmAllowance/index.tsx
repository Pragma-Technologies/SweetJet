import { useTvmAllowance } from '@pragma-web-utils/api'
import { useMulticallCollector } from '../../../services/multicall/MulticallService'
import { Address } from '@pragma-web-utils/core'

export const TvmAllowance = (): JSX.Element => {
  const testSpender = ''
  const testAccount = 'TW2FbcbdhFX3qvCsaVf3vww6Yvey2paECi'
  const testToken = 'TW2FbcbdhFX3qvCsaVf3vww6Yvey2paECi'
  const grpcUrl = ''
  const multicall = new Address('')
  const requestCollector = useMulticallCollector()

  const allowance = useTvmAllowance()
  return <div></div>
}
