import { HttpProvider, IpcProvider, RequestArguments, WebsocketProvider } from 'web3-core'
import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'

export interface AbstractProvider {
  connected?: boolean

  sendAsync?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void

  send?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void

  request?(args: RequestArguments): Promise<unknown>
}

export type BaseProvider = HttpProvider | IpcProvider | WebsocketProvider | AbstractProvider | null
export type Destructor = () => void
export type ConnectionInfo = {
  chainId?: number
  account?: string
  isConnected: boolean
  isActive: boolean
  isActivating: boolean
  provider: BaseProvider
}
export type Listener = {
  next?: (event: ConnectionInfo) => void
  error?: (error: unknown) => void
  complete?: () => void
}

export interface NetworkDetails {
  rpc: string
  chainId: number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export type EthereumListener = (...args: unknown[]) => void

export interface EthereumProvider {
  isWalletLink?: boolean
  isMetaMask?: boolean
  providers?: EthereumProvider[]
  connected?: boolean

  once(eventName: string | symbol, listener: EthereumListener): void

  on(eventName: string | symbol, listener: EthereumListener): void

  removeListener(eventName: string | symbol, listener: EthereumListener): void

  request<T = unknown>(args: RequestArguments): Promise<T>

  send?(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
}
