import { ethers } from 'ethers'

export interface RequestArguments {
  method: string
  params?: unknown

  [key: string]: unknown
}

export type LimitedTronWeb = {
  fullNode: false | { host: string }
  defaultAddress: false | { base58: string }
  request<T = unknown>(args: RequestArguments): Promise<T>
  toHex: (message: string) => string
  version: string
  trx: {
    sign: (message: string) => Promise<string>
    signMessageV2: (message: string) => Promise<string>
    verifyMessage: (_message: string, signature: string, account: string) => Promise<boolean>
    verifyMessageV2: (_message: string, signature: string) => Promise<string>
    getBalance: (address: string) => Promise<string | number | ethers.BigNumber>
  }
}
