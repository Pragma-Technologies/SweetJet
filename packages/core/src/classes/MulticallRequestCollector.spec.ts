import { ethers } from 'ethers'
import { ConnectorBaseEnum } from '../enums'
import { MulticallCaller, Output } from '../types'
import { wait } from '../utils'
import * as MulticallCallers from '../utils/multicall'
import { Address } from './Address'
import { MulticallRequestCollector } from './MulticallRequestCollector'

const outputs: Output[] = [{ internalType: 'uint256', name: '', type: 'uint256' }]
const abiItem = {
  inputs: [],
  name: 'test',
  outputs,
  stateMutability: 'view',
  type: 'function',
}

const mockCaller = async (): ReturnType<MulticallCaller> => {
  await wait(100)
  return [['0x00000000000000000000000000000000000000000000000000000000000003e8']]
}
const _testMulticallCaller: jest.Mock<ReturnType<MulticallCaller>> = jest.fn(mockCaller)

const scInterface = new ethers.utils.Interface([abiItem])

describe('MulticallRequestCollector class', () => {
  const _getEvmMulticallCaller: jest.SpyInstance = jest
    .spyOn(MulticallCallers, 'getEvmMulticallCaller')
    .mockImplementation(() => _testMulticallCaller)
  const _getTvmMulticallCaller: jest.SpyInstance = jest
    .spyOn(MulticallCallers, 'getTvmMulticallCaller')
    .mockImplementation(() => _testMulticallCaller)

  beforeEach(() => {
    _getTvmMulticallCaller.mockReset().mockImplementation(() => _testMulticallCaller)
    _getEvmMulticallCaller.mockReset().mockImplementation(() => _testMulticallCaller)
    _testMulticallCaller.mockReset().mockImplementation(mockCaller)
  })

  it('check single EVM request', async () => {
    const multicallRequestCollector = new MulticallRequestCollector()

    const response = await multicallRequestCollector.request({
      contractAddress: new Address(),
      base: ConnectorBaseEnum.EVM,
      rpcUrl: 'rpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    })

    expect(response.toString()).toBe('1000')
    expect(_getEvmMulticallCaller).toBeCalledTimes(1)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)
  })

  it('check single TVM request', async () => {
    const multicallRequestCollector = new MulticallRequestCollector()

    const response = await multicallRequestCollector.request({
      contractAddress: new Address(),
      base: ConnectorBaseEnum.TVM,
      rpcUrl: 'grpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    })

    expect(response.toString()).toBe('1000')
    expect(_getTvmMulticallCaller).toBeCalledTimes(1)
    expect(_getEvmMulticallCaller).toBeCalledTimes(0)
  })

  it('check different request scope', async () => {
    const multicallRequestCollector = new MulticallRequestCollector()

    const evmRequestOptions = {
      contractAddress: new Address(),
      base: ConnectorBaseEnum.EVM,
      rpcUrl: 'rpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    }
    const tvmRequestOptions = {
      contractAddress: new Address(),
      base: ConnectorBaseEnum.TVM,
      rpcUrl: 'grpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    }
    const response1 = multicallRequestCollector.request(evmRequestOptions)
    const response2 = multicallRequestCollector.request(evmRequestOptions)
    const response3 = multicallRequestCollector.request(tvmRequestOptions)
    const response4 = multicallRequestCollector.request(tvmRequestOptions)

    expect((await response1).toString()).toBe('1000')
    expect((await response2).toString()).toBe('1000')
    expect((await response3).toString()).toBe('1000')
    expect((await response4).toString()).toBe('1000')
    expect(_getEvmMulticallCaller).toBeCalledTimes(1)
    expect(_getTvmMulticallCaller).toBeCalledTimes(1)
  })

  it('check few requests scope one by one', async () => {
    const multicallRequestCollector = new MulticallRequestCollector()

    const evmRequestOptions = {
      contractAddress: new Address(),
      base: ConnectorBaseEnum.EVM,
      rpcUrl: 'rpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    }

    const response1 = multicallRequestCollector.request(evmRequestOptions)
    const response2 = multicallRequestCollector.request(evmRequestOptions)

    expect((await response1).toString()).toBe('1000')
    expect((await response2).toString()).toBe('1000')
    expect(_getEvmMulticallCaller).toBeCalledTimes(1)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)

    const response3 = multicallRequestCollector.request(evmRequestOptions)
    const response4 = multicallRequestCollector.request(evmRequestOptions)

    expect((await response3).toString()).toBe('1000')
    expect((await response4).toString()).toBe('1000')
    expect(_getEvmMulticallCaller).toBeCalledTimes(2)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)
  })

  it('check few requests scope without waiting response of first scope', async () => {
    const multicallRequestCollector = new MulticallRequestCollector()

    const evmRequestOptions = {
      contractAddress: new Address(),
      base: ConnectorBaseEnum.EVM,
      rpcUrl: 'rpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    }

    const response1 = multicallRequestCollector.request(evmRequestOptions)
    const response2 = multicallRequestCollector.request(evmRequestOptions)

    // wait collecting request
    await wait(10)

    expect(_getEvmMulticallCaller).toBeCalledTimes(1)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)

    // wait few milliseconds to send new scope (previous not finished)
    await wait(10)

    const response3 = multicallRequestCollector.request(evmRequestOptions)
    const response4 = multicallRequestCollector.request(evmRequestOptions)

    expect((await response1).toString()).toBe('1000')
    expect((await response2).toString()).toBe('1000')
    expect((await response3).toString()).toBe('1000')
    expect((await response4).toString()).toBe('1000')

    expect(_getEvmMulticallCaller).toBeCalledTimes(2)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)
  })

  it('check few requests scope split requests by energy', async () => {
    const multicallRequestCollector = new MulticallRequestCollector(3_500, 1_400)

    const evmRequestOptions = {
      contractAddress: new Address(),
      base: ConnectorBaseEnum.EVM,
      rpcUrl: 'rpcUrl',
      callInfo: {
        method: abiItem.name,
        output: abiItem.outputs,
        scInterface,
        values: [],
        target: new Address(),
      },
    }

    expect(_getEvmMulticallCaller).toBeCalledTimes(0)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)
    expect(_testMulticallCaller).toBeCalledTimes(0)

    const response1 = multicallRequestCollector.request(evmRequestOptions)
    const response2 = multicallRequestCollector.request(evmRequestOptions)
    const response3 = multicallRequestCollector.request(evmRequestOptions)

    // wait collecting request
    await wait(10)

    expect(_testMulticallCaller).toBeCalledTimes(2)
    expect(_getEvmMulticallCaller).toBeCalledTimes(1)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)

    expect((await response1).toString()).toBe('1000')
    expect((await response2).toString()).toBe('1000')
    expect((await response3).toString()).toBe('1000')

    const response4 = multicallRequestCollector.request({
      ...evmRequestOptions,
      callInfo: { ...evmRequestOptions.callInfo, energy: 4_000 },
    })
    const response5 = multicallRequestCollector.request({
      ...evmRequestOptions,
      callInfo: { ...evmRequestOptions.callInfo, energy: 400 },
    })
    const response6 = multicallRequestCollector.request(evmRequestOptions)
    const response7 = multicallRequestCollector.request({
      ...evmRequestOptions,
      callInfo: { ...evmRequestOptions.callInfo, energy: 3_300 },
    })

    // wait collecting request
    await wait(10)

    expect(_testMulticallCaller).toBeCalledTimes(5)
    expect(_getEvmMulticallCaller).toBeCalledTimes(2)
    expect(_getTvmMulticallCaller).toBeCalledTimes(0)

    expect((await response4).toString()).toBe('1000')
    expect((await response5).toString()).toBe('1000')
    expect((await response6).toString()).toBe('1000')
    expect((await response7).toString()).toBe('1000')
  })
})
