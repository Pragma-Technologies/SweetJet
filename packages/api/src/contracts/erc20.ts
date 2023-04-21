import { ExternalProvider } from '@ethersproject/providers'
import { Address } from '@pragma-web-utils/core'
import { ethers } from 'ethers'
import { getContract } from '.'
import { abiERC20 } from '../abi'
import { AbiERC20, AbiERC20Interface } from '../abi/typings/AbiERC20'

export function getErc20Contract(rpcUrlOrProvider: string | ExternalProvider, address: Address): AbiERC20 {
  return getContract(rpcUrlOrProvider, getErc20Interface(), address)
}

export function getErc20Interface(): AbiERC20Interface {
  return new ethers.utils.Interface(abiERC20.abi) as AbiERC20Interface
}
