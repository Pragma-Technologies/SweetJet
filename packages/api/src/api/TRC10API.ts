/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Address,
  ConnectorBaseEnum,
  MulticallRequestCollector,
  Output,
  RequestDelayUtils,
} from '@pragma-web-utils/core'
import { ethers } from 'ethers'
import { TronWeb } from 'tronweb-typings'
import { FEE_LIMIT } from '../constants'
import { BN, fromBNish } from '../utils/tsUtils'

const allowanceAbiItem = {
  inputs: [
    { internalType: 'address', name: '_owner', type: 'address' },
    { internalType: 'address', name: '_spender', type: 'address' },
  ],
  name: 'allowance',
  outputs: [{ internalType: 'uint256', name: 'remaining', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
}
const allowanceScInterface = new ethers.utils.Interface([allowanceAbiItem])

async function allowance(
  collector: MulticallRequestCollector,
  rpcUrl: string,
  multicallAddress: Address,
  contractAddress: Address,
  owner: Address,
  spender: Address,
): Promise<BN> {
  const [response] = await collector.request({
    callInfo: {
      scInterface: allowanceScInterface,
      method: 'allowance',
      values: [owner.toHex(), spender.toHex()],
      output: allowanceAbiItem.outputs as Output[],
      target: contractAddress,
    },
    contractAddress: multicallAddress,
    base: ConnectorBaseEnum.TVM,
    rpcUrl,
  })
  return response as BN
}

async function approve(tronWeb: TronWeb, contractAddress: Address, spender: Address, value: BN): Promise<string> {
  const message = { feeLimit: FEE_LIMIT }
  await RequestDelayUtils.addDelay()
  const abi = await import('../abi/tron/abiTRC10.json')
  return await tronWeb.contract(abi.default, contractAddress.toBase58()).approve(spender.toHex(), value).send(message)
}

async function feeBalanceOf(tronWeb: any, account: string): Promise<BN> {
  await RequestDelayUtils.addDelay()
  const _balance: unknown = await tronWeb.trx.getBalance(account)
  return fromBNish(`${_balance}`)
}

export const TRC10API = { allowance, approve, feeBalanceOf }
