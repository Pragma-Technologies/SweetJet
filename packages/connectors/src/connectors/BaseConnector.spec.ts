import { EMPTY_ADDRESS } from '@pragma-web-utils/core'
import { TestBaseConnector, TestEthereumConnector } from '../testSuits'
import { NetworkDetails } from '../types'
import { BaseConnector, ConnectResultEnum } from './BaseConnector'
import { FortmaticConnector } from './FortmaticConnect'

jest.mock('fortmatic')

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

describe.each<{ name: string; getConnector: () => BaseConnector }>([
  {
    name: 'TestBaseConnector',
    getConnector: () => new TestBaseConnector(supportedNetworks, defaultNetwork.chainId, activeChainId),
  },
  {
    name: 'TestEthereumConnector',
    getConnector: () => new TestEthereumConnector(supportedNetworks, defaultNetwork.chainId, activeChainId),
  },
  {
    name: 'FortmaticConnector',
    getConnector: () => new FortmaticConnector(supportedNetworks, defaultNetwork.chainId, activeChainId, 'fakeApiKey'),
  },
])(`BaseConnector implementations`, ({ getConnector, name }) => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it(`${name}: connect/disconnect`, async () => {
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

    await connector.disconnect()

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
  it(`${name}: connect provided chain`, async () => {
    const connector = getConnector()

    const onNext = jest.fn()
    const onError = jest.fn()
    const onComplete = jest.fn()
    const destructor = connector.subscribe({ next: onNext, error: onError, complete: onComplete })

    const status = await connector.connect(additionalNetwork.chainId)
    // wait connect to other chain
    await Promise.resolve()

    expect(status).toBe(ConnectResultEnum.SUCCESS)
    expect(connector.defaultChainId).toBe(defaultNetwork.chainId)
    expect(connector.chainId).toBe(additionalNetwork.chainId)
    expect(connector.account).toBe(EMPTY_ADDRESS)
    expect(connector.isConnected).toBe(true)
    expect(connector.isActivating).toBe(false)
    expect(connector.isActive).toBe(true)
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
  it(`${name}: switch network`, async () => {
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

    await connector.switchNetwork(additionalNetwork.chainId)

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
  it(`${name}: setup network`, async () => {
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

    await connector.setupNetwork({
      chainId: 3,
      rpc: 'rpc',
      chainName: 'test',
      nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
    })

    expect(connector.chainId).toBe(3)
    expect(onNext).toHaveBeenLastCalledWith({
      account: EMPTY_ADDRESS,
      chainId: 3,
      isActive: true,
      isActivating: false,
      isConnected: true,
      provider: connector.getProvider(),
    })
    expect(onError).toBeCalledTimes(0)
    expect(onComplete).toBeCalledTimes(0)
    destructor()
  })
})
