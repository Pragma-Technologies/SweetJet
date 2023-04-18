import { TvmChainIdsEnum } from '@pragma-web-utils/core'
import { TronWeb } from 'tronweb-typings'
import { WalletConnectionStatusEnum } from '../enums/services/WalletConnectionStatusEnum'

export interface TronWebDetails {
  account: string | undefined
  chainId: TvmChainIdsEnum | undefined
  tronWeb: TronWeb | undefined

  activate(onError?: (error: Error) => void, throwErrors?: boolean): Promise<void>
}

export interface TronWebNode {
  solidityNode?: { host?: string }
  defaultAddress?: { base58?: string | false }
}

export interface RequestAccounts {
  code: WalletConnectionStatusEnum
  message: string
}
