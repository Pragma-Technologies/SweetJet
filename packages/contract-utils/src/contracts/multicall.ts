import { Provider } from '@ethersproject/providers'
import { Contract, Signer } from 'ethers'
import { abiMulticall, Multicall } from '../abi'

export const getEvmMulticallContract = (contractAddress: string, signerOrProvider: Signer | Provider): Multicall => {
  return new Contract(contractAddress, abiMulticall.abi, signerOrProvider) as Multicall
}
