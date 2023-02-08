import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { NetworkDetails } from '../types'
import { FortmaticConnector } from './FortmaticConnect'

// TODO: mock result of call
const getProvider = jest.fn()

jest.mock('fortmatic', () => {
  class FakeFortmatic {
    getProvider() {
      getProvider()
      return { request: async () => [EMPTY_ADDRESS] }
    }
  }

  return FakeFortmatic
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

describe('FortmaticConnector', () => {
  beforeEach(() => {
    getProvider.mockReset()
  })

  it('several connections: mapping providers', async () => {
    const connector = new FortmaticConnector(supportedNetworks, defaultNetwork.chainId, activeChainId, 'fakeApiKey')

    expect(getProvider).toBeCalledTimes(0)
    await connector.connect()

    const defaultProvider = connector.getProvider()
    expect(connector.chainId).toBe(defaultNetwork.chainId)
    expect(getProvider).toBeCalledTimes(1)

    await connector.switchNetwork(additionalNetwork.chainId)

    expect(connector.chainId).toBe(additionalNetwork.chainId)
    expect(getProvider).toBeCalledTimes(2)
    expect(connector.getProvider()).not.toBe(defaultProvider)

    await connector.switchNetwork(defaultNetwork.chainId)

    expect(connector.chainId).toBe(defaultNetwork.chainId)
    expect(getProvider).toBeCalledTimes(2)
    expect(connector.getProvider()).toBe(defaultProvider)
  })
})
