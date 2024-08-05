import { ConnectorBaseEnum, EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { act, renderHook } from '@testing-library/react'
import { StorableRequestedTx, StorableTx, TxService } from '../classes'
// @ts-ignore
import * as TxServiceContext from '../core/context'
import { TestTxChecker } from '../utils'
import { useTransactionList, useTxList } from './useTxList'

const testChecker = new TestTxChecker()
const checkersMap = new Map([[1, testChecker]])

let txService: TxService
const txLike1 = new StorableRequestedTx({
  base: ConnectorBaseEnum.EVM,
  chainId: 1,
  payload: { action: 'test' },
  account: EMPTY_ADDRESS,
})
const tx1 = new StorableTx(
  {
    base: ConnectorBaseEnum.EVM,
    chainId: 1,
    payload: { action: 'test' },
    account: EMPTY_ADDRESS,
    hash: 'testHash1',
  },
  checkersMap,
  () => Promise.resolve(null),
)

describe('useTxList', () => {
  beforeEach(() => {
    txService = new TxService()
    jest.spyOn(TxServiceContext, 'useTxService').mockImplementation(() => txService)
  })

  it('common hook', async () => {
    const { result } = renderHook(() => useTxList())

    expect(result.current.length).toBe(0)

    act(() => txService.add(txLike1))

    expect(result.current.length).toBe(1)
  })

  it('useTransactionList', async () => {
    const { result } = renderHook(() => useTransactionList())

    expect(result.current.length).toBe(0)

    act(() => txService.add(txLike1))

    expect(result.current.length).toBe(0)

    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(result.current.length).toBe(1)
  })
})
