Connector - `class` implemented interface to connect related blockchain provider api. All connectors inherit `abstract` `BaseConnector`.

## BaseConnector

All types of connectors implement `BaseConnector` interface and have similar behavior

### Interface:
```ts
interface BaseConnector<T extends BaseProvider = BaseProvider> {
  readonly chainId: number | undefined
  readonly account: IAddress | undefined
  readonly isActivating: boolean
  readonly isActive: boolean
  readonly isConnected: boolean
  supportedNetworks: NetworkDetails[]
  activeChainIds: number[]

  signMessage(message: string): Promise<string>
  connect(chainId?: number): Promise<ConnectResultEnum>
  disconnect(): Promise<void>
  switchNetwork(chainId?: number): Promise<void>
  setupNetwork(networkDetails: NetworkDetails): Promise<void>
  getProvider(): T
  getChainId(): number | undefined
  getAccount(): IAddress | undefined
  subscribe(listener: Listener): Destructor
}

type BaseProvider = { // blockchain provider
  connected?: boolean
  sendAsync?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
  send?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
  request?(args: RequestArguments): Promise<unknown>
}

interface IAddress {
  set(address?: string): void
  toString(): string
  toHex(): string
  toBase58(): string
  isEmpty(): boolean
}

interface NetworkDetails {
  rpc: string
  chainId: number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}
 
type Destructor = () => void

interface Listener {
  next?: (event: ConnectionInfo) => void
  error?: (error: unknown) => void
  complete?: () => void
}

interface ConnectionInfo {
  chainId?: number
  account?: Address
  isConnected: boolean
  isActive: boolean
  isActivating: boolean
  provider: BaseProvider
}

enum ConnectResultEnum {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
}
```

### Properties

- `chainId` - connected chainId
- `account` - connected address
- `isActivating` - connecting status (`true` if connecting in progress)
- `isActive` - connecting status (`true` if connected, and connected chain in the list of activeChainIds)
- `isConnected` - connecting status (`true` if connected to any chain)
- `supportedNetworks` - list of networks supported of connector. On switch chain, connector asks to setup network from provider if network is not configured yet. Array can be empty, but if provided correctly increase user experience
- `activeChainIds` - list of chain supported of connector. Connector disconnect from an unknown chain

### Methods

- `signMessage` - sign provider message. Trow error if `Connector.isConnected` equals `false`
- `connect` - try to connect to blockchain provider and listen current `account` and `chainId` changes
- `disconnect` - reset all properties and unsubscribe on `account` and `chainId` listener
- `switchNetwork` - request provider switch network
- `setupNetwork` - add network to `supportedNetworks` add chain id to activeChainIds
- `getProvider` - return related blockchain provider, or null if not connected
- `getChainId` - return current chainId
- `getAccount` - return connected account
- `subscribe` - subscribe on `account` and `chainId` changes. On detect changes provide callback to field `next`, on listen errors provide callback to field `error`, on listen close connection provide callback to field `complete` (on call method `disconnect`, or from provider `disconnect` event)

### Listen changes example

```ts
const someConnector: BaseConnector = new SomeConnector()

someConnector.subscribe({
  next: (data) => console.log('next', data),
  error: (error) => console.warn('error', error),
  complete: () => console.log('complete')
})

someConnector.connect()

// 'next' {  chainId: undefined, account: undefined, isConnected: false, isActive: false, isActivating: true, provider: null }
// 'next' {  chainId: 123, account: { _hex: 0x123..789 }, isConnected: true, isActive: true, isActivating: false, provider: {} }

someConnector.switchNetwork(321)

// 'next' {  chainId: 321, account: { _hex: 0x123..789 }, isConnected: true, isActive: true, isActivating: false, provider: {} }

someConnector.disconnect()

// 'next' {  chainId: undefined, account: undefined, isConnected: false, isActive: false, isActivating: false, provider: null }
// 'complete'
```

## InjectedConnector, MetamaskConnector, CoinbaseConnector, and WalletConnectConnector

These connectors are for ethereum provider integration. InjectedConnector is the most common connector for connecting any type of extension or native app provider. MetamaskConnector, CoinbaseConnector, and WalletConnectConnector connectors try to connect related provider if it possible.

<div style="border-left: rgb(55,154,137) 5px solid;">

> ### <span style="color: rgb(55,154,137);">ⓘ Info</span>
> For ethereum connectors using `personal_sign` method for sign provided text message

</div>

## TronConnector

This connector only for tron related provider

<div style="border-left: rgb(55,154,137) 5px solid;">

> ### <span style="color: rgb(55,154,137);">ⓘ Info</span>
> Tron has two methods for sign message `sign` and `signMessageV2`. Firstly try to use `signMessageV2` but if catch error or connected `TronWeb` doesn't support it, use `sign` method for sign provided text message

</div>
