import { EthereumListener, EthereumProvider, NetworkDetails } from '../types'
import { EthereumConnector } from './EthereumConnector'

export class ExternalSourceConnector<T extends EthereumProvider = EthereumProvider> extends EthereumConnector<T> {
  protected _externalSource: () => Promise<T | null> = () => Promise.resolve(null)
  protected _disconnectSource: () => Promise<void> = () => Promise.resolve()

  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  setExternalSource(source: () => Promise<T | null>, disconnectSource: () => Promise<void>): void {
    this._externalSource = source
    this._disconnectSource = disconnectSource
  }

  protected async getEthereumProvider(): Promise<T | null> {
    return this._externalSource()
  }

  // unsubscribe from all ethereum events and clear state
  protected _onDisconnect = async (error?: { code: number; [key: string]: unknown }): Promise<void> => {
    // ignore if disconnection was by EthereumProvider inner bug
    if (error?.code === 1013) {
      return
    }

    error && console.error(error)

    this._chainId = undefined
    this._account = undefined
    this.emitEvent()
    this.completeListeners()
    this._provider?.removeListener('connect', this._onConnect as EthereumListener)
    this._provider?.removeListener('disconnect', this._onDisconnect as EthereumListener)
    this._provider?.removeListener('chainChanged', this._onChangeChainId as EthereumListener)
    this._provider?.removeListener('accountsChanged', this._onChangeAccount as EthereumListener)
    await this._disconnectSource()
  }
}
