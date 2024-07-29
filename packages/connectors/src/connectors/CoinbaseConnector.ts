import CoinbaseWalletSDK, { CoinbaseWalletProvider } from '@coinbase/wallet-sdk'
import { NetworkDetails } from '../types'
import { InjectedConnector } from './InjectedConnector'

export class CoinbaseConnector extends InjectedConnector<CoinbaseWalletProvider> {
  name = CoinbaseConnector.name

  constructor(
    supportedNetworks: NetworkDetails[],
    defaultChainId: number,
    activeChainId: number[] = [],
    protected _appName: string,
  ) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  protected async getEthereumProvider(): Promise<CoinbaseWalletProvider | null> {
    const networkDetails = this.supportedNetworks.find((item) => item.chainId === this.defaultChainId)
    if (!networkDetails) {
      return null
    }

    const sdk = new CoinbaseWalletSDK({ appName: this._appName })
    return sdk.makeWeb3Provider(networkDetails.rpc)
  }
}
