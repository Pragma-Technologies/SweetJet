import { ConnectorBaseEnum, EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react'
import { TxService } from '../classes'
// @ts-ignore
import * as TxServiceContext from '../core/context'
import { Transaction, TransactionLike } from '../types'
import { isTransaction, TestTxChecker } from '../utils'
import { useRegisterTx } from './useRegisterTx'

let txService: TxService

const testChecker = new TestTxChecker()
const checkersMap = new Map([[1, testChecker]])

describe('register Tx by hook', () => {
  beforeEach(() => {
    txService = new TxService()
    jest.spyOn(TxServiceContext, 'useTxService').mockImplementation(() => txService)
  })

  it('useRegisterTx', async () => {
    const { result } = renderHook(() => useRegisterTx())
    const resultTx = await result.current(
      {
        account: EMPTY_ADDRESS,
        chainId: 1,
        payload: { action: 'test' },
        base: ConnectorBaseEnum.EVM,
      },
      checkersMap,
      async () => null,
      async () => 'testHash',
    )
    expect(resultTx.account).toEqual(EMPTY_ADDRESS)
    expect(resultTx.chainId).toEqual(1)
    expect(resultTx.payload).toEqual({ action: 'test' })
    expect(resultTx.base).toEqual(ConnectorBaseEnum.EVM)
    expect(resultTx.hash).toEqual('testHash')

    expect(txService.getList().length).toBe(1)
    expect(txService.hasItem(resultTx.id)).toBe(true)
    expect(isTransaction(txService.getItem(resultTx.id)?.getValue() as TransactionLike)).toBe(true)
    expect((txService.getItem(resultTx.id)?.getValue() as Transaction).hash).toBe('testHash')
  })
})
