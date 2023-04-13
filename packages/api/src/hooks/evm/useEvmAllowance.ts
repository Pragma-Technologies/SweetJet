import { HookCommonState, useCommonState } from '@pragma-web-utils/common-state'
import { Address, MulticallRequestCollector } from '@pragma-web-utils/core'
import { BigNumber } from 'ethers'
import { useEffect } from 'react'
import { Erc20Api } from '../../api'

export function useEvmAllowance(
  spender: Address,
  token: Address,
  account: string,
  rpcUrl: string,
  multicall: Address,
  multicallCollector: MulticallRequestCollector,
): HookCommonState<BigNumber | undefined> {
  const { state, setRefresh } = useCommonState<BigNumber>()

  useEffect(() => {
    const owner = new Address(account)
    const requestKey = `${rpcUrl}_${token}_${account}_${spender}`
    const refreshFn = async () => Erc20Api.allowance(multicallCollector, rpcUrl, multicall, token, spender, owner)
    const onError = (error: unknown) => console.error('useEvmAllowance', error)
    setRefresh({ refreshFn, requestKey, onError })
  }, [rpcUrl, account, token, spender, multicallCollector, multicall])

  useEffect(state.hardRefresh, [rpcUrl, account, token, spender])

  return state
}
