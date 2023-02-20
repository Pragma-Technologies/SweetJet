import { ConnectorBaseEnum, EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { StorableMultichainTx, StorableRequestedTx, StorableTx, TxService } from '../classes'
// @ts-ignore
import * as TxServiceContext from '../core/context'
import { TestTxChecker } from '../utils'
import { useMultichainTxList, useTransactionList, useTxList } from './useTxList'

const testChecker = new TestTxChecker()

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
  testChecker,
)
const multichainTx1 = new StorableMultichainTx(
  {
    base: ConnectorBaseEnum.EVM,
    chainId: 1,
    payload: { action: 'test' },
    account: EMPTY_ADDRESS,
    hash: 'testHash1',
    destination: {
      base: ConnectorBaseEnum.EVM,
      chainId: 2,
    },
  },
  testChecker,
  testChecker,
  async () => '',
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

    await act(async () => {
      txService.add(multichainTx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(result.current.length).toBe(1)
  })

  it('useMultichainTxList', async () => {
    const { result } = renderHook(() => useMultichainTxList())

    expect(result.current.length).toBe(0)

    act(() => txService.add(txLike1))

    expect(result.current.length).toBe(0)

    await act(async () => {
      txService.add(multichainTx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(result.current.length).toBe(1)

    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(result.current.length).toBe(1)
  })
})
