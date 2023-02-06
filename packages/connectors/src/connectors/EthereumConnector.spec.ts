import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { TestEthereumConnector, TestEthereumProvider } from '../testSuits'
import { NetworkDetails } from '../types'
import { ConnectResultEnum } from './BaseConnector'
import { EthereumConnector } from './EthereumConnector'

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

interface EthereumConnectorSuit {
  name: string
  getConnector: () => EthereumConnector
  changeAccount: (account: string) => void
  changeChainId: (chainId: number) => void
  disconnect: (error?: unknown) => void
  resetProvider: () => void
}

let testProvider = new TestEthereumProvider()
describe.each<EthereumConnectorSuit>([
  {
    name: 'TestEthereumConnector',
    getConnector: () =>
      new TestEthereumConnector(testProvider, supportedNetworks, defaultNetwork.chainId, activeChainId),
    changeAccount: (account) => {
      testProvider._testAccount = account
      testProvider._testProviderListeners['accountsChanged'].forEach((listener) =>
        listener([testProvider._testAccount]),
      )
    },
    changeChainId: (chainId) => {
      const newChainId = `0x${chainId.toString(16)}`
      testProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: newChainId }] })
    },
    disconnect: (error) => {
      testProvider._testProviderListeners['disconnect'].forEach((listener) => listener(error))
    },
    resetProvider: () => {
      testProvider = new TestEthereumProvider()
    },
  },
])('EthereumConnector', ({ name, resetProvider, getConnector, changeChainId, changeAccount, disconnect }) => {
  beforeEach(() => {
    resetProvider()
  })

  it(`${name}: check provider change account`, async () => {
    const connector = getConnector()

    const onNext = jest.fn()
    const onError = jest.fn()
    const onComplete = jest.fn()
    const destructor = connector.subscribe({ next: onNext, error: onError, complete: onComplete })

    await connector.connect()

    expect(connector.chainId).toBe(defaultNetwork.chainId)
    expect(onNext).toHaveBeenLastCalledWith({
      account: EMPTY_ADDRESS,
      chainId: defaultNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)

    const newAccount = '0x0000000000000000000000000000000000000001'
    changeAccount(newAccount)

    expect(connector.chainId).toBe(defaultNetwork.chainId)
    expect(onNext).toHaveBeenLastCalledWith({
      account: newAccount,
      chainId: defaultNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)
    destructor()
  })
  it(`${name}: check provider change chainId`, async () => {
    const connector = getConnector()

    const onNext = jest.fn()
    const onError = jest.fn()
    const onComplete = jest.fn()
    const destructor = connector.subscribe({ next: onNext, error: onError, complete: onComplete })

    await connector.connect()

    expect(connector.chainId).toBe(defaultNetwork.chainId)
    expect(onNext).toHaveBeenLastCalledWith({
      account: EMPTY_ADDRESS,
      chainId: defaultNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)

    const newChainId = additionalNetwork.chainId
    changeChainId(newChainId)

    expect(connector.chainId).toBe(additionalNetwork.chainId)
    expect(onNext).toHaveBeenLastCalledWith({
      account: EMPTY_ADDRESS,
      chainId: additionalNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)
    destructor()
  })
  it(`${name}: check provider disconnect by itself`, async () => {
    const connector = getConnector()

    expect(connector.defaultChainId).toBe(defaultNetwork.chainId)
    expect(connector.chainId).toBe(undefined)
    expect(connector.account).toBe(undefined)
    expect(connector.isConnected).toBe(false)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(false)

    const onNext = jest.fn()
    const onError = jest.fn()
    const onComplete = jest.fn()
    const destructor = connector.subscribe({ next: onNext, error: onError, complete: onComplete })

    const status = await connector.connect()

    expect(status).toBe(ConnectResultEnum.SUCCESS)
    expect(connector.defaultChainId).toBe(defaultNetwork.chainId)
    expect(connector.chainId).toBe(defaultNetwork.chainId)
    expect(connector.account).toBe(EMPTY_ADDRESS)
    expect(connector.isConnected).toBe(true)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(true)
    expect(onNext).toHaveBeenLastCalledWith({
      account: EMPTY_ADDRESS,
      chainId: defaultNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)

    disconnect({ code: 1013 })

    expect(connector.isConnected).toBe(true)

    disconnect()

    expect(connector.defaultChainId).toBe(defaultNetwork.chainId)
    expect(connector.chainId).toBe(undefined)
    expect(connector.account).toBe(undefined)
    expect(connector.isConnected).toBe(false)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(false)
    expect(onNext).toHaveBeenLastCalledWith({
      account: undefined,
      chainId: undefined,
      isActive: false,
      isActivating: false,
      isConnected: false,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(1)

    destructor()
  })
})
