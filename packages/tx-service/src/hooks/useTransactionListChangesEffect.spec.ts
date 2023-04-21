import { ConnectorBaseEnum, EMPTY_ADDRESS, TransactionStatusEnum } from '@pragma-web-utils/core'
import { Deps } from '@pragma-web-utils/hooks'
import { act, renderHook } from '@testing-library/react-hooks'
import { StorableMultichainTx, StorableRequestedTx, StorableTx, TxService } from '../classes'
// @ts-ignore
import * as TxServiceContext from '../core/context'
import { TransactionLike } from '../types'
import { isRequestedTx, isTransaction, TestTxChecker } from '../utils'
import { useTransactionListChangesEffect } from './useTransactionListChangesEffect'

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

describe('useTransactionListChangesEffect', () => {
  beforeEach(() => {
    txService = new TxService()
    jest.spyOn(TxServiceContext, 'useTxService').mockImplementation(() => txService)
  })

  it('without filter and deps', async () => {
    const _callback = jest.fn()
    renderHook(() => useTransactionListChangesEffect(_callback))

    expect(_callback).toBeCalledTimes(0)

    act(() => txService.add(txLike1))

    expect(_callback).toBeCalledTimes(1)
    expect(_callback).toHaveBeenLastCalledWith([txLike1.getValue()])

    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // calls on add and on update
    expect(_callback).toBeCalledTimes(3)
    expect(_callback).toHaveBeenLastCalledWith([
      txLike1.getValue(),
      {
        ...tx1.getValue(),
        status: TransactionStatusEnum.SUCCESS,
      },
    ])

    await act(async () => {
      txService.add(multichainTx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // multichainTx1 hash same as tx1, and list not updated
    expect(_callback).toBeCalledTimes(3)
  })

  it('with filter, but without deps', async () => {
    const _callback = jest.fn()
    const { rerender } = renderHook(
      ([filter]: [(tx: TransactionLike) => boolean]) => useTransactionListChangesEffect(_callback, filter),
      { initialProps: [isTransaction] },
    )

    expect(_callback).toBeCalledTimes(0)

    act(() => txService.add(txLike1))

    expect(_callback).toBeCalledTimes(1)
    expect(_callback).toHaveBeenLastCalledWith([])

    // try update filter, but without deps change filter don't updated
    rerender([isRequestedTx])
    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // calls on add and on update
    expect(_callback).toBeCalledTimes(3)
    expect(_callback).toHaveBeenLastCalledWith([{ ...tx1.getValue(), status: TransactionStatusEnum.SUCCESS }])

    await act(async () => {
      txService.add(multichainTx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // multichainTx1 hash same as tx1, and list not updated
    expect(_callback).toBeCalledTimes(3)
  })

  it('with filter and deps', async () => {
    const _destructor = jest.fn()
    const _callback = jest.fn(() => _destructor)
    const { rerender } = renderHook(
      ([filter, deps]: [(tx: TransactionLike) => boolean, Deps]) =>
        useTransactionListChangesEffect(_callback, filter, deps),
      { initialProps: [isRequestedTx, [1]] },
    )

    expect(_callback).toBeCalledTimes(0)
    expect(_destructor).toBeCalledTimes(0)

    act(() => txService.add(txLike1))

    expect(_callback).toBeCalledTimes(1)
    expect(_callback).toHaveBeenLastCalledWith([txLike1.getValue()])
    expect(_destructor).toBeCalledTimes(0)

    // try update filter and deps for apply updates
    rerender([isTransaction, [2]])
    expect(_destructor).toBeCalledTimes(1)

    await act(async () => {
      txService.add(tx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // calls on add and on update
    expect(_callback).toBeCalledTimes(3)
    expect(_callback).toHaveBeenLastCalledWith([{ ...tx1.getValue(), status: TransactionStatusEnum.SUCCESS }])
    expect(_destructor).toBeCalledTimes(1)

    await act(async () => {
      txService.add(multichainTx1)
      // wait updating status on tx
      await Promise.resolve()
    })

    // multichainTx1 hash same as tx1, and list not updated
    expect(_callback).toBeCalledTimes(3)
    expect(_destructor).toBeCalledTimes(1)
  })
})
