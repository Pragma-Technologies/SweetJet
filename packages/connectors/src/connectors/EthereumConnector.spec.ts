import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { RequestArguments } from 'web3-core'
import { EthereumListener, EthereumProvider, NetworkDetails } from '../types'
import { ConnectResultEnum } from './BaseConnector'
import { EthereumConnector } from './EthereumConnector'

const listeners: Record<string | symbol, EthereumListener[]> = {}
let chainId = '0x1'

const provider: EthereumProvider = {
  connected: true,
  once(eventName, listener) {
    // @ts-ignore
    if (!listeners[eventName]) {
      // @ts-ignore
      listeners[eventName] = []
    }
    // @ts-ignore
    listeners[eventName].push(listener)
  },
  on(eventName, listener) {
    // @ts-ignore
    if (!listeners[eventName]) {
      // @ts-ignore
      listeners[eventName] = []
    }
    // @ts-ignore
    listeners[eventName].push(listener)
  },
  removeListener(eventName, listener) {
    // @ts-ignore
    if (!listeners[eventName]) {
      // @ts-ignore
      listeners[eventName] = (listeners[eventName] ?? []).filter((item) => item !== listener)
    }
  },
  async request<T = unknown>({ params, method }: RequestArguments): Promise<T> {
    switch (method) {
      case 'eth_chainId':
        return chainId as unknown as T
      case 'eth_requestAccounts':
        return [EMPTY_ADDRESS] as unknown as T
      case 'wallet_addEthereumChain':
      case 'wallet_switchEthereumChain':
        const newChainId = params[0].chainId
        if (newChainId !== chainId) {
          chainId = newChainId
          listeners['chainChanged']?.forEach((listener) => listener(newChainId))
        }
        return undefined as unknown as T
      default:
        return undefined as unknown as T
    }
  },
}

class TestEthereumConnector extends EthereumConnector {
  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  protected getEthereumProvider(): Promise<EthereumProvider | null> {
    return Promise.resolve(provider)
  }
}

describe('EthereumConnector', () => {
  beforeEach(() => {
    chainId = '0x1'
  })
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
