import { ConnectionState } from '@coinbase/wallet-sdk/dist/connection/RxWebSocket'
import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { AbstractProvider, BaseProvider, NetworkDetails } from '../types'
import { BaseConnector, ConnectResultEnum } from './BaseConnector'

const testProvider = {
  connected: true,
  sendAsync(payload, callback) {},
  send(payload, callback) {},
  async request(args) {},
} as AbstractProvider

class TestBaseConnector extends BaseConnector {
  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  connect(chainId?: number): Promise<ConnectResultEnum> {
    this._chainId = chainId ?? this.defaultChainId
    this._account = EMPTY_ADDRESS
    return Promise.resolve(ConnectResultEnum.SUCCESS)
  }

  async disconnect(): Promise<void> {
    this._chainId = undefined
    this._account = undefined
  }

  getProvider(): BaseProvider {
    return testProvider
  }

  async setupNetwork({ chainId }: NetworkDetails): Promise<void> {
    this._chainId = chainId
  }

  async switchNetwork(chainId: number | undefined): Promise<void> {
    this._chainId = chainId
  }
}

describe('BaseConnector', () => {
  it('connect/disconnect', async () => {
    const connector: BaseConnector = new TestBaseConnector([], 1)

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
    const connector: BaseConnector = new TestBaseConnector([], 1)

    const status = await connector.connect(2)

    expect(status).toBe(ConnectResultEnum.SUCCESS)
    expect(connector.defaultChainId).toBe(1)
    expect(connector.chainId).toBe(2)
    expect(connector.account).toBe(EMPTY_ADDRESS)
    expect(connector.isConnected).toBe(true)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(true)
  })
  it('switch network', async () => {
    const connector: BaseConnector = new TestBaseConnector([], 1)

    await connector.connect()

    expect(connector.chainId).toBe(1)

    await connector.switchNetwork(2)

    expect(connector.chainId).toBe(2)
  })
  it('setup network', async () => {
    const connector: BaseConnector = new TestBaseConnector([], 1)

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
