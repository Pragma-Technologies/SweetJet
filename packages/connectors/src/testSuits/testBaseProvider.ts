import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { BaseConnector, ConnectResultEnum } from '../connectors'
import { AbstractProvider, BaseProvider, NetworkDetails } from '../types'

export const testProvider = {
  connected: true,
  sendAsync(payload, callback) {},
  send(payload, callback) {},
  async request(args) {},
} as AbstractProvider

export class TestBaseConnector extends BaseConnector {
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
