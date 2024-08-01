import { ConnectorBaseEnum, EMPTY_ADDRESS, wait } from '@pragma-web-utils/core'
import { Deps } from '@pragma-web-utils/hooks'
import { act, renderHook } from '@testing-library/react'
import { StorableRequestedTx, StorableTx, TxService } from '../classes'
// @ts-ignore
import * as TxServiceContext from '../core/context'
import { Payload, TransactionLike } from '../types'
import { TestTxChecker } from '../utils'
import { useFinishPendingTransactionEffect } from './useFinishPendingTransactionEffect'

const testChecker = new TestTxChecker()
const checkersMap = new Map([[1, testChecker]])

const relatedInfo: Pick<TransactionLike, 'account' | 'chainId' | 'base'> = {
  base: ConnectorBaseEnum.EVM,
  chainId: 1,
  account: EMPTY_ADDRESS,
}
let txService: TxService
const txLike1 = new StorableRequestedTx({
  ...relatedInfo,
  payload: { action: 'test' },
})
const tx1 = new StorableTx(
  {
    ...relatedInfo,
    payload: { action: 'test2' },
    hash: 'testHash1',
  },
  checkersMap,
  () => Promise.resolve(null),
)
const tx2 = new StorableTx(
  {
    ...relatedInfo,
    payload: { action: 'test3' },
    hash: 'testHash2',
  },
  checkersMap,
  () => Promise.resolve(null),
)

describe('useFinishPendingTransactionEffect', () => {
  beforeEach(() => {
    txService = new TxService()
    jest.spyOn(TxServiceContext, 'useTxService').mockImplementation(() => txService)
  })

  it('without filter and deps', async () => {
    const _callback = jest.fn()
    renderHook(() => useFinishPendingTransactionEffect(relatedInfo, _callback))

    expect(_callback).toBeCalledTimes(0)

    act(() => txService.add(txLike1))

    expect(_callback).toBeCalledTimes(0)

    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(_callback).toBeCalledTimes(1)

    await act(async () => {
      txService.add(tx2)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(_callback).toBeCalledTimes(2)
  })

  it('with filter, but without deps', async () => {
    const _callback = jest.fn()
    const { rerender } = renderHook(
      ([filter]: [(payload: Payload) => boolean]) => useFinishPendingTransactionEffect(relatedInfo, _callback, filter),
      { initialProps: [(payload) => payload.action.startsWith('test')] },
    )

    expect(_callback).toBeCalledTimes(0)

    act(() => txService.add(txLike1))

    expect(_callback).toBeCalledTimes(0)

    // try update filter, but without deps change filter don't updated
    rerender([(payload) => payload.action === 'test2'])
    await Promise.resolve()
    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // calls on add and on update
    expect(_callback).toBeCalledTimes(1)

    await act(async () => {
      txService.add(tx2)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(_callback).toBeCalledTimes(2)
  })

  it('with filter and deps', async () => {
    const _destructor = jest.fn()
    const _callback = jest.fn(() => _destructor)
    const { rerender } = renderHook(
      ([filter, deps]: [(payload: Payload) => boolean, Deps]) =>
        useFinishPendingTransactionEffect(relatedInfo, _callback, filter, deps),
      { initialProps: [(payload) => payload.action.startsWith('test'), [1]] },
    )

    expect(_callback).toBeCalledTimes(0)
    expect(_destructor).toBeCalledTimes(0)

    act(() => txService.add(txLike1))

    expect(_callback).toBeCalledTimes(0)
    expect(_destructor).toBeCalledTimes(0)

    // try update filter and deps for apply updates
    rerender([(payload) => payload.action === 'test2', [2]])
    await Promise.resolve()
    expect(_destructor).toBeCalledTimes(0)

    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // calls on add and on update
    expect(_callback).toBeCalledTimes(1)
    expect(_destructor).toBeCalledTimes(0)

    // try update filter and deps for apply updates
    rerender([(payload) => payload.action === 'test1', [3]])
    expect(_destructor).toBeCalledTimes(1)

    await act(async () => {
      txService.add(tx2)
      // wait updating status on tx
      await Promise.resolve()
    })

    expect(_callback).toBeCalledTimes(1)
    expect(_destructor).toBeCalledTimes(1)
  })
})
