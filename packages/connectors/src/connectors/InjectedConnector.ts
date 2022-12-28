import detectEthereumProvider from '@metamask/detect-provider'
import { EthereumProvider, NetworkDetails } from '../types'
import { EthereumConnector } from './EthereumConnector'

export class InjectedConnector<T extends EthereumProvider = EthereumProvider> extends EthereumConnector<T> {
  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  protected async getEthereumProvider(): Promise<T | null> {
    const provider = (await detectEthereumProvider()) as T | null
    return (provider?.providers ? provider?.providers[0] ?? provider : provider) as T | null
  }
}
