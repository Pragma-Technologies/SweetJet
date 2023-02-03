import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { TestBaseConnector, TestEthereumConnector } from '../testSuits'
import { BaseConnector, ConnectResultEnum } from './BaseConnector'
import { FortmaticConnector } from './FortmaticConnect'

jest.mock('fortmatic')

describe.each<{ name: string; getConnector: () => BaseConnector }>([
  { name: 'TestBaseConnector', getConnector: () => new TestBaseConnector([], 1, [1, 2]) },
  { name: 'TestEthereumConnector', getConnector: () => new TestEthereumConnector([], 1, [1, 2]) },
  {
    name: 'FortmaticConnector',
    getConnector: () =>
      new FortmaticConnector(
        [
          {
            chainId: 1,
            rpc: 'rpc',
            chainName: 'test',
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
          },
          {
            chainId: 2,
            rpc: 'rpc',
            chainName: 'test',
            nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
          },
        ],
        1,
        [1, 2],
        '',
      ),
  },
])(`BaseConnector implementations`, ({ getConnector, name }) => {
  it(`${name}: connect/disconnect`, async () => {
    const connector = getConnector()

    expect(connector.defaultChainId).toBe(1)
    expect(connector.chainId).toBe(undefined)
    expect(connector.account).toBe(undefined)
    expect(connector.isConnected).toBe(false)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(false)

    const status = await connector.connect()

    expect(status).toBe(ConnectResultEnum.SUCCESS)
    expect(connector.defaultChainId).toBe(1)
    expect(connector.chainId).toBe(1)
    expect(connector.account).toBe(EMPTY_ADDRESS)
    expect(connector.isConnected).toBe(true)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(true)

    await connector.disconnect()

    expect(connector.defaultChainId).toBe(1)
    expect(connector.chainId).toBe(undefined)
    expect(connector.account).toBe(undefined)
    expect(connector.isConnected).toBe(false)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(false)
  })
  it(`${name}: connect provided chain`, async () => {
    const connector = getConnector()

    const status = await connector.connect(2)
    await Promise.resolve()

    expect(status).toBe(ConnectResultEnum.SUCCESS)
    expect(connector.defaultChainId).toBe(1)
    expect(connector.chainId).toBe(2)
    expect(connector.account).toBe(EMPTY_ADDRESS)
    expect(connector.isConnected).toBe(true)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(true)
  })
  it(`${name}: switch network`, async () => {
    const connector = getConnector()

    await connector.connect()

    expect(connector.chainId).toBe(1)

    await connector.switchNetwork(2)

    expect(connector.chainId).toBe(2)
  })
  it(`${name}: setup network`, async () => {
    const connector = getConnector()

    await connector.connect()

    expect(connector.chainId).toBe(1)

    await connector.setupNetwork({
      chainId: 2,
      rpc: 'rpc',
      chainName: 'test',
      nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
    })

    expect(connector.chainId).toBe(2)
  })
})
