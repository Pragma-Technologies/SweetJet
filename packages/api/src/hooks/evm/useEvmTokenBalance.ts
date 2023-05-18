import { CommonState, useCommonState } from '@pragma-web-utils/common-state'
import { Address, MulticallRequestCollector } from '@pragma-web-utils/core'
import { BigNumber } from 'ethers'
import { useEffect } from 'react'
import { Erc20Api } from '../../api'
import { BN } from '../../utils'

export function useEvmTokenBalance(
  account: string,
  token: Address,
  rpcUrl: string,
  multicall: Address,
  multicallCollector: MulticallRequestCollector,
): CommonState<BN | undefined> {
  const { state, setRefresh } = useCommonState<BigNumber>()

  useEffect(() => {
    const requestKey = `${rpcUrl}_${token.toHex()}_${account}`
    const refreshFn = async () => await Erc20Api.balanceOf(multicallCollector, rpcUrl, multicall, token, account)
    const onError = (error: unknown) => console.error('useEvmTokenBalance', error)
    setRefresh({ refreshFn, requestKey, onError })
  }, [rpcUrl, account, token, account, multicallCollector, multicall])

  useEffect(state.hardRefresh, [rpcUrl, account, token, account])

  return state
}
