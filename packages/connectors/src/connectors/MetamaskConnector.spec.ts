import { TestEthereumProvider } from '../testSuits'
import { NetworkDetails } from '../types'
import { MetamaskConnector } from './MetamaskConnector'

class TestMetamaskProvider extends TestEthereumProvider {
  isMetaMask = true
}

let providers: TestEthereumProvider[] = []

const defaultNetwork: NetworkDetails = {
  chainId: 1,
  rpc: 'rpc',
  chainName: 'test',
  nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
}
const additionalNetwork: NetworkDetails = {
  chainId: 2,
  rpc: 'rpc',
  chainName: 'test',
  nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
}
const supportedNetworks: NetworkDetails[] = [defaultNetwork, additionalNetwork]
const activeChainId = supportedNetworks.map(({ chainId }) => chainId)

jest.mock('@metamask/detect-provider', () => async () => ({ providers }))

describe('MetamaskConnector', () => {
  beforeEach(() => {
    providers = []
  })
  it('check connect if exist metamask provider', async () => {
    const testProvider = new TestEthereumProvider()
    const testMetamaskProvider = new TestMetamaskProvider()
    providers = [testProvider, testMetamaskProvider]
    const connector1 = new MetamaskConnector(supportedNetworks, defaultNetwork.chainId, activeChainId)

    await connector1.connect()

    expect(connector1.getProvider()?.isMetaMask).toBe(true)
    expect(connector1.getProvider()).toBe(testMetamaskProvider)

    providers = [testMetamaskProvider, testProvider]
    const connector2 = new MetamaskConnector(supportedNetworks, defaultNetwork.chainId, activeChainId)

    await connector2.connect()

    expect(connector2.getProvider()?.isMetaMask).toBe(true)
    expect(connector1.getProvider()).toBe(testMetamaskProvider)
  })
  it('check connect if not exist metamask provider', async () => {
    const testProvider = new TestEthereumProvider()
    providers = [testProvider, new TestEthereumProvider(), new TestEthereumProvider()]
    const connector = new MetamaskConnector(supportedNetworks, defaultNetwork.chainId, activeChainId)

    await connector.connect()

    expect(connector.getProvider()?.isMetaMask).toBeFalsy()
    expect(connector.getProvider()).toBe(testProvider)
  })
})
