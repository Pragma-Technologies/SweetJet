import { Address } from '@pragma-web-utils/core'
import Fortmatic from 'fortmatic'
import { AbstractProvider, NetworkDetails } from '../types'
import { BaseConnector, ConnectResultEnum } from './BaseConnector'

export class FortmaticConnector extends BaseConnector<AbstractProvider | null> {
  private _providersMap: Map<number, AbstractProvider> = new Map<number, AbstractProvider>()
  private _provider: AbstractProvider | null = null

  constructor(
    supportedNetworks: NetworkDetails[],
    defaultChainId: number,
    activeChainId: number[] = [],
    private _apiKey: string,
  ) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  async connect(chainId: number = this.defaultChainId): Promise<ConnectResultEnum> {
    if (!!this._provider) {
      this.emitEvent()
      return ConnectResultEnum.ALREADY_CONNECTED
    }

    const networkDetails = this.supportedNetworks.find((item) => item.chainId === chainId)
    if (!networkDetails) {
      return ConnectResultEnum.FAIL
    }

    const fortmaticConfig = { rpcUrl: networkDetails.rpc, chainId: networkDetails.chainId }
    this._provider = new Fortmatic(this._apiKey, fortmaticConfig).getProvider() as AbstractProvider
    this._providersMap.set(chainId, this._provider)
    if (!this._provider || !this._provider.request) {
      return ConnectResultEnum.FAIL
    }

    this._isActivating = true
    this.emitEvent()
    try {
      this._chainId = chainId
      const [account] = (await this._provider.request({ method: 'eth_accounts' })) as string[]
      this._account = account ? Address.from(account) : undefined
      this._isActivating = false
      this.emitEvent()
      return ConnectResultEnum.SUCCESS
    } catch (e) {
      this._isActivating = false
      this.disconnect()
      return ConnectResultEnum.FAIL
    }
  }

  async disconnect(): Promise<void> {
    this._chainId = undefined
    this._account = undefined
    this._provider = null
    this.emitEvent()
    this.completeListeners()
  }

  getProvider(): AbstractProvider | null {
    return this._provider
  }

  async setupNetwork(networkDetails: NetworkDetails): Promise<void> {
    if (!this._supportedNetworks.some((item) => item.chainId === networkDetails.chainId)) {
      this._supportedNetworks = [...this._supportedNetworks, networkDetails]
    }
    await this.switchNetwork(networkDetails.chainId)
  }

  // imitate switching network just initiating new provider
  async switchNetwork(chainId: number = this.defaultChainId): Promise<void> {
    const otherChainProvider = this._providersMap.get(chainId)
    if (!!otherChainProvider) {
      this._chainId = chainId
      this._provider = otherChainProvider
      return
    }

    const cacheProvider = this._provider
    this._provider = null
    const result = await this.connect(chainId)
    if (result !== ConnectResultEnum.SUCCESS) {
      this._provider = cacheProvider
    }
  }
}
