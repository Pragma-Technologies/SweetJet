import { Address, EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { BaseConnector, ConnectResultEnum } from '../connectors'
import { AbstractProvider, BaseProvider, NetworkDetails } from '../types'

export const testProvider = {
  connected: true,
  sendAsync(payload, callback) {},
  send(payload, callback) {},
  async request(args) {},
} as AbstractProvider

export class TestBaseConnector extends BaseConnector {
  name = TestBaseConnector.name

  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  signMessage(message: string): Promise<string> {
    throw new Error('Not implemented')
  }

  connect(chainId?: number): Promise<ConnectResultEnum> {
    this._chainId = chainId ?? this.defaultChainId
    this._account = Address.from()
    this.emitEvent()
    return Promise.resolve(ConnectResultEnum.SUCCESS)
  }

  async disconnect(): Promise<void> {
    this._chainId = undefined
    this._account = undefined
    this.emitEvent()
    this.completeListeners()
  }

  getProvider(): BaseProvider {
    return testProvider
  }

  async setupNetwork(networkDetails: NetworkDetails): Promise<void> {
    if (!this._supportedNetworks.some((item) => item.chainId === networkDetails.chainId)) {
      this._supportedNetworks = [...this._supportedNetworks, networkDetails]
      this._activeChainIds = [...this._activeChainIds, networkDetails.chainId]
    }
    this._chainId = networkDetails.chainId
    this.emitEvent()
  }

  async switchNetwork(chainId: number | undefined): Promise<void> {
    this._chainId = chainId
    this.emitEvent()
  }
}
