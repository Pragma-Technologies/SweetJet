import { InjectedConnector } from './InjectedConnector'
import { EthereumProvider } from '../types'
import detectEthereumProvider from '@metamask/detect-provider'

export class MetamaskConnector extends InjectedConnector {
  protected async getEthereumProvider(): Promise<EthereumProvider | null> {
    const provider = (await detectEthereumProvider()) as EthereumProvider | null
    if (provider?.providers?.length) {
      return provider.providers.find((p) => p.isMetaMask) ?? provider.providers[0]
    }
    return provider
  }
}
