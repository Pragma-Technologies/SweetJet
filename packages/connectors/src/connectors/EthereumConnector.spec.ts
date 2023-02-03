import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { TestEthereumConnector } from '../testSuits'
import { ConnectResultEnum } from './BaseConnector'
import { EthereumConnector } from './EthereumConnector'

describe('EthereumConnector', () => {
  it('connect/disconnect', async () => {
    const connector = new TestEthereumConnector([], 1, [1, 2])

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
  it('connect provided chain', async () => {
    const connector = new TestEthereumConnector([], 1, [1, 2])

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
  it('switch network', async () => {
    const connector = new TestEthereumConnector([], 1, [1, 2])

    await connector.connect()

    expect(connector.chainId).toBe(1)

    await connector.switchNetwork(2)

    expect(connector.chainId).toBe(2)
  })
  it('setup network', async () => {
    const connector = new TestEthereumConnector([], 1, [1, 2])

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
