import { Address, ConnectorBaseEnum, TvmChainIdsEnum } from '@pragma-web-utils/core'
import { TxStatusChecker, useRegisterTx } from '@pragma-web-utils/tx-service'
import { useCallback } from 'react'
import { TronWeb } from 'tronweb-typings'
import { TRC10API } from '../../api'
import { getMaxIntValue } from '../../utils'

type ApproveProps = (spender: Address, transactionAction: string) => Promise<void>

export function useTvmApprove(
  contractAddress: Address,
  decimals: number,
  library: TronWeb,
  account: string,
  chainId: TvmChainIdsEnum,
  txChecker: TxStatusChecker,
): ApproveProps {
  const registerTx = useRegisterTx()

  return useCallback<ApproveProps>(
    async (spender, action) => {
      try {
        await registerTx({ account, chainId, base: ConnectorBaseEnum.TVM, payload: { action } }, txChecker, () =>
          TRC10API.approve(library, contractAddress, spender, getMaxIntValue(decimals)),
        )
      } catch (error) {
        console.error('useTvmApprove', error)
      }
    },
    [library, account, chainId, txChecker, contractAddress.toString(), decimals, registerTx],
  )
}
