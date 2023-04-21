import { ExternalProvider } from '@ethersproject/providers'
import { Address, ConnectorBaseEnum, MulticallRequestCollector } from '@pragma-web-utils/core'
import { getErc20Contract, getErc20Interface } from '../contracts'

import { BN } from '../utils'

export const Erc20Api = {
  allowance: async (
    collector: MulticallRequestCollector,
    rpcUrl: string,
    multicallAddress: Address,
    tokenAddress: Address,
    spender: Address,
    owner: Address,
  ): Promise<BN> => {
    const [allowance] = await collector.request({
      callInfo: {
        scInterface: getErc20Interface(),
        method: 'allowance',
        values: [owner.toHex(), spender.toHex()],
        output: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        target: tokenAddress,
      },
      contractAddress: multicallAddress,
      base: ConnectorBaseEnum.EVM,
      rpcUrl,
    })
    return allowance as BN
  },
  balanceOf: async (
    collector: MulticallRequestCollector,
    rpcUrl: string,
    multicallAddress: Address,
    tokenAddress: Address,
    account: string,
  ): Promise<BN> => {
    const [balance] = await collector.request({
      callInfo: {
        scInterface: getErc20Interface(),
        method: 'balanceOf',
        values: [account],
        output: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        target: tokenAddress,
      },
      contractAddress: multicallAddress,
      base: ConnectorBaseEnum.EVM,
      rpcUrl,
    })
    return balance as BN
  },
  approve: async (provider: ExternalProvider, token: Address, spender: Address, amount: BN): Promise<string> => {
    const { hash } = await getErc20Contract(provider, token).functions.approve(spender.toHex(), amount)
    return hash
  },
}
