import { TestWalletConnectProvider } from '../testSuits'
import { NetworkDetails } from '../types'
import { WalletConnectConnector } from './WalletConnectConnector'

let testProvider = new TestWalletConnectProvider()

jest.mock('@walletconnect/ethereum-provider', () => {
  class FakeWalletConnect {
    static init() {
      return testProvider
    }
  }

  return FakeWalletConnect
})

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

describe('WalletConnectConnector', () => {
  beforeEach(() => {
    testProvider = new TestWalletConnectProvider()
  })
  it('check connect without previous sessions', async () => {
    const connector = new WalletConnectConnector(supportedNetworks, defaultNetwork.chainId, {
      projectId: 'testProjectId',
      chains: activeChainId,
      showQrModal: true,
    })

    const connect = jest.spyOn(testProvider, 'connect')

    expect(connect).toBeCalledTimes(0)
    await connector.connect()
    expect(connect).toBeCalledTimes(1)
  })
  it('check connect with previous sessions', async () => {
    // set previous session before connect
    testProvider._session = {}

    const connector = new WalletConnectConnector(supportedNetworks, defaultNetwork.chainId, {
      projectId: 'testProjectId',
      chains: activeChainId,
      showQrModal: true,
    })

    const connect = jest.spyOn(testProvider, 'connect')

    expect(connect).toBeCalledTimes(0)
    await connector.connect()
    expect(connect).toBeCalledTimes(0)
  })
  it('check disconnect', async () => {
    const connector = new WalletConnectConnector(supportedNetworks, defaultNetwork.chainId, {
      projectId: 'testProjectId',
      chains: activeChainId,
      showQrModal: true,
    })

    const disconnect = jest.spyOn(testProvider, 'disconnect')

    await connector.connect()

    expect(disconnect).toBeCalledTimes(0)
    await connector.disconnect()
    expect(disconnect).toBeCalledTimes(1)
  })
})
