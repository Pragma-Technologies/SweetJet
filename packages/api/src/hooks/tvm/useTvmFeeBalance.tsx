import { HookCommonState, useCommonState } from '@pragma-web-utils/common-state'
import { TvmChainIdsEnum } from '@pragma-web-utils/core'
import { useEffect } from 'react'
import { TronWeb } from 'tronweb-typings'
import { TRC10API } from '../../api'
import { BN } from '../../utils'

export const useTvmFeeBalance = (
  account: string,
  tronWeb: TronWeb,
  chainId: TvmChainIdsEnum,
): HookCommonState<BN | undefined> => {
  const { state, setRefresh } = useCommonState<BN>(undefined)

  useEffect(() => {
    const refreshFn = async () => await TRC10API.feeBalanceOf(tronWeb, account)
    const onError = (error: unknown) => console.error('useTvmFeeBalance', error)

    const requestKey = `${account}_${chainId} `
    setRefresh({ refreshFn, requestKey, onError })
  }, [account])

  useEffect(() => state.softRefresh(), [account, chainId])

  return state
}
