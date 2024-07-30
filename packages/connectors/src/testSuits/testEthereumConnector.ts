import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { RequestArguments } from 'web3-core'
import { EthereumConnector } from '../connectors'
import { EthereumListener, EthereumProvider, NetworkDetails } from '../types'

export class TestEthereumProvider implements EthereumProvider {
  public _testProviderListeners: Record<string | symbol, EthereumListener[]> = {}
  public _testProviderChainId = '0x1'
  public _testAccount = EMPTY_ADDRESS
  connected = true

  once(eventName: string, listener: EthereumListener) {
    if (!this._testProviderListeners[eventName]) {
      this._testProviderListeners[eventName] = []
    }
    this._testProviderListeners[eventName].push(listener)
  }

  on(eventName: string, listener: EthereumListener) {
    if (!this._testProviderListeners[eventName]) {
      this._testProviderListeners[eventName] = []
    }
    this._testProviderListeners[eventName].push(listener)
  }

  removeListener(eventName: string, listener: EthereumListener) {
    if (!this._testProviderListeners[eventName]) {
      this._testProviderListeners[eventName] = (this._testProviderListeners[eventName] ?? []).filter(
        (item) => item !== listener,
      )
    }
  }

  async request<T = unknown>({ params, method }: RequestArguments): Promise<T> {
    switch (method) {
      case 'eth_chainId':
        return this._testProviderChainId as unknown as T
      case 'eth_requestAccounts':
        return [this._testAccount] as unknown as T
      case 'wallet_addEthereumChain':
      case 'wallet_switchEthereumChain':
        const newChainId = params[0].chainId
        if (newChainId !== this._testProviderChainId) {
          this._testProviderChainId = newChainId
          this._testProviderListeners['chainChanged']?.forEach((listener) => listener(newChainId))
        }
        return undefined as unknown as T
      default:
        return undefined as unknown as T
    }
  }
}

export class TestEthereumConnector extends EthereumConnector {
  name = TestEthereumConnector.name

  constructor(
    public _testProvider: EthereumProvider,
    supportedNetworks: NetworkDetails[],
    defaultChainId: number,
    activeChainId: number[] = [],
  ) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  protected getEthereumProvider(): Promise<EthereumProvider | null> {
    return Promise.resolve(this._testProvider)
  }
}
