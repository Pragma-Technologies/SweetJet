import { ExternalProvider } from '@ethersproject/providers'
import { Address, ConnectorBaseEnum, EvmChainIdsEnum } from '@pragma-web-utils/core'
import { TxStatusChecker, useRegisterTx } from '@pragma-web-utils/tx-service'
import { useCallback } from 'react'
import { Erc20Api } from '../../api'
import { MAX_INT_VALUE } from '../../constants'
import { fromDecimals } from '../../utils'

type ApproveRequest = (
  account: string,
  chainId: EvmChainIdsEnum,
  token: Address,
  spender: Address,
  decimals: number,
  action: string,
  txChecker: TxStatusChecker,
) => Promise<void>

export function useEvmApprove(library: { provider: ExternalProvider }): ApproveRequest {
  const registerTx = useRegisterTx()

  return useCallback<ApproveRequest>(
    async (account, chainId, token, spender, decimals, action, txChecker) => {
      try {
        await registerTx({ account, chainId, base: ConnectorBaseEnum.EVM, payload: { action } }, txChecker, () =>
          Erc20Api.approve(library.provider, token, spender, fromDecimals(MAX_INT_VALUE, decimals)),
        )
      } catch (error) {
        console.error('useEvmApprove', error)
      }
    },
    [library, registerTx],
  )
}
