import EthereumProvider from '@walletconnect/ethereum-provider'
import { NetworkDetails } from '../types'
import { EthereumConnector } from './EthereumConnector'

export class WalletConnectConnector extends EthereumConnector<EthereumProvider> {
  protected _network_not_exist_error_codes: number[] = [4902, -32000] // 4902 as default, -3200 for MetaMask app

  protected async getEthereumProvider(): Promise<EthereumProvider | null> {
    const networkInfo = this.supportedNetworks.find((item) => item.chainId === this.defaultChainId)
    const rpcMap: { [key: number]: string } = {}
    this.supportedNetworks.forEach(({ chainId, rpc }) => (rpcMap[chainId] = rpc))
    return this._provider || new EthereumProvider({ chainId: networkInfo?.chainId, rpc: rpcMap })
  }

  protected _onDisconnect = async (error?: { code: number; [key: string]: unknown }): Promise<void> => {
    error && console.error(error)

    this._chainId = undefined
    this._account = undefined
    this.emitEvent()
    this.completeListeners()
    this._provider?.removeListener('connect', this._onConnect)
    this._provider?.removeListener('disconnect', this._onDisconnect)
    this._provider?.removeListener('chainChanged', this._onChangeChainId)
    this._provider?.removeListener('accountsChanged', this._onChangeAccount)

    await this._provider?.disconnect()
    this._provider = null
  }

  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }
}
