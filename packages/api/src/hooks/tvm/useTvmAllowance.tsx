import { CommonState, useCommonState } from '@pragma-web-utils/common-state'
import { Address, MulticallRequestCollector } from '@pragma-web-utils/core'
import { useEffect } from 'react'
import { TRC10API } from '../../api'
import { BN } from '../../utils'

export function useTvmAllowance(
  spender: Address,
  token: Address,
  account: string,
  grpcUrl: string,
  multicall: Address,
  requestCollector: MulticallRequestCollector,
): CommonState<BN | undefined> {
  const { state, setRefresh } = useCommonState<BN>()

  useEffect(() => {
    const _account = new Address(account)
    const requestKey = `${grpcUrl}_${multicall}_${token}_${account}_${spender}`
    const refreshFn = async () => TRC10API.allowance(requestCollector, grpcUrl, multicall, token, _account, spender)
    const onError = (error: unknown) => console.error('useTvmAllowance', error)
    setRefresh({ refreshFn, requestKey, onError })
  }, [requestCollector, grpcUrl, multicall.toString(), token.toString(), account, spender.toString()])

  useEffect(state.hardRefresh, [grpcUrl, token.toString(), account, spender.toString()])

  return state
}
