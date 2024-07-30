import { Address, EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { TestEthereumConnector, TestEthereumProvider, TestWalletConnectProvider } from '../testSuits'
import { NetworkDetails } from '../types'
import { ConnectResultEnum } from './BaseConnector'
import { CoinbaseConnector } from './CoinbaseConnector'
import { EthereumConnector } from './EthereumConnector'
import { InjectedConnector } from './InjectedConnector'
import { MetamaskConnector } from './MetamaskConnector'
import { WalletConnectConnector } from './WalletConnectConnector'

let testProvider = new TestEthereumProvider()
let testWalletConnectProvider = new TestWalletConnectProvider()

jest.mock('@coinbase/wallet-sdk', () => {
  class FakeCoinbaseWalletSDK {
    makeWeb3Provider() {
      return testProvider
    }
  }

  return FakeCoinbaseWalletSDK
})

jest.mock('@metamask/detect-provider', () => async () => testProvider)

jest.mock('@walletconnect/ethereum-provider', () => {
  class FakeWalletConnect {
    static init() {
      return testWalletConnectProvider
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

interface EthereumConnectorSuit {
  name: string
  getConnector: () => EthereumConnector
  changeAccount: (account: string) => void
  changeChainId: (chainId: number) => void
  disconnect: (error?: unknown) => void
  resetProvider: () => void
}

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
  {
    name: 'CoinbaseConnector',
    getConnector: () => new CoinbaseConnector(supportedNetworks, defaultNetwork.chainId, activeChainId, 'testApp'),
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
  {
    name: 'InjectedConnector',
    getConnector: () => new InjectedConnector(supportedNetworks, defaultNetwork.chainId, activeChainId),
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
  {
    name: 'MetamaskConnector',
    getConnector: () => new MetamaskConnector(supportedNetworks, defaultNetwork.chainId, activeChainId),
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
  {
    name: 'WalletConnectConnector',
    getConnector: () =>
      new WalletConnectConnector(supportedNetworks, defaultNetwork.chainId, {
        projectId: 'testProjectId',
        chains: activeChainId,
        showQrModal: true,
      }),
    changeAccount: (account) => {
      testWalletConnectProvider._testAccount = account
      testWalletConnectProvider._testProviderListeners['accountsChanged'].forEach((listener) =>
        listener([testWalletConnectProvider._testAccount]),
      )
    },
    changeChainId: (chainId) => {
      const newChainId = `0x${chainId.toString(16)}`
      testWalletConnectProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: newChainId }] })
    },
    disconnect: (error) => {
      testWalletConnectProvider._testProviderListeners['disconnect'].forEach((listener) => listener(error))
    },
    resetProvider: () => (testWalletConnectProvider = new TestWalletConnectProvider()),
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
      account: Address.from(),
      chainId: defaultNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)

    const newAccount = Address.from('0x0000000000000000000000000000000000000001')
    changeAccount(newAccount.toHex())

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
      account: Address.from(),
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
      account: Address.from(),
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
    expect(connector.account?.toHex()).toBe(EMPTY_ADDRESS)
    expect(connector.isConnected).toBe(true)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(true)
    expect(onNext).toHaveBeenLastCalledWith({
      account: Address.from(),
      chainId: defaultNetwork.chainId,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)

    // TODO: move it to custom setting check
    // disconnect({ code: 1013 })
    //
    // expect(connector.isConnected).toBe(true)

    disconnect()
    // wait disconnect microtask finished
    await Promise.resolve()

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
