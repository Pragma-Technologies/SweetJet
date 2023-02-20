import { ConnectorBaseEnum, EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react-hooks'
import { TxService } from '../classes'
// @ts-ignore
import * as TxServiceContext from '../core/context'
import { MultichainTransaction, Transaction, TransactionLike } from '../types'
import { isMultichainTx, isTransaction, TestTxChecker } from '../utils'
import { useRegisterMultichainTx, useRegisterTx } from './useRegisterTx'

let txService: TxService

const testChecker = new TestTxChecker()

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
      testChecker,
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
  it('useRegisterMultichainTx', async () => {
    const { result } = renderHook(() => useRegisterMultichainTx())
    const resultTx = await result.current(
      {
        account: EMPTY_ADDRESS,
        chainId: 1,
        payload: { action: 'test' },
        base: ConnectorBaseEnum.EVM,
        destination: {
          base: ConnectorBaseEnum.EVM,
          chainId: 2,
        },
      },
      testChecker,
      testChecker,
      async () => 'testHash',
      async () => 'testDestinationHash',
    )

    // wait destination hash, status and storage update
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(resultTx.account).toEqual(EMPTY_ADDRESS)
    expect(resultTx.chainId).toEqual(1)
    expect(resultTx.payload).toEqual({ action: 'test' })
    expect(resultTx.base).toEqual(ConnectorBaseEnum.EVM)
    expect(resultTx.hash).toEqual('testHash')
    expect(resultTx.destination.hash).toEqual(undefined)
    expect(resultTx.destination.chainId).toEqual(2)
    expect(resultTx.destination.base).toEqual(ConnectorBaseEnum.EVM)

    expect(txService.getList().length).toBe(1)
    expect(txService.hasItem(resultTx.id)).toBe(true)
    expect(isMultichainTx(txService.getItem(resultTx.id)?.getValue() as TransactionLike)).toBe(true)
    expect((txService.getItem(resultTx.id)?.getValue() as MultichainTransaction).hash).toBe('testHash')
    expect((txService.getItem(resultTx.id)?.getValue() as MultichainTransaction).destination.hash).toBe(
      'testDestinationHash',
    )
  })
})
