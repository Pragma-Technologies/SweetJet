import EthereumProvider from '@walletconnect/ethereum-provider'
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import { ProviderRpcError } from '@walletconnect/ethereum-provider/dist/types/types'
import { NetworkDetails } from '../types'
import { EthereumConnector } from './EthereumConnector'

export class WalletConnectConnector extends EthereumConnector<EthereumProvider> {
  name = WalletConnectConnector.name

  // TODO: recheck error codes
  protected _network_not_exist_error_codes: number[] = [4902, -32000] // 4902 as default, -3200 for MetaMask app

  constructor(
    supportedNetworks: NetworkDetails[],
    defaultChainId: number,
    protected _providerOptions: EthereumProviderOptions,
  ) {
    super(supportedNetworks, defaultChainId, _providerOptions.chains)
  }

  protected async getEthereumProvider(): Promise<EthereumProvider | null> {
    const _provider = await EthereumProvider.init(this._providerOptions)
    !_provider.session && (await _provider.connect())
    return _provider
  }

  protected _onDisconnect = async (error?: { code: number; [key: string]: unknown }): Promise<void> => {
    error && console.error(error)

    this._chainId = undefined
    this._account = undefined

    this._provider?.removeListener('connect', this._onConnect)
    this._provider?.removeListener('disconnect', this._onDisconnect as unknown as (err: ProviderRpcError) => void)
    this._provider?.removeListener('chainChanged', this._onChangeChainId)
    this._provider?.removeListener('accountsChanged', this._onChangeAccount)

    await this._provider?.disconnect()

    this.emitEvent()
    this.completeListeners()
  }
}
