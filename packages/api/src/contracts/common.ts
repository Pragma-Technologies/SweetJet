import { ContractInterface } from '@ethersproject/contracts'
import { ExternalProvider } from '@ethersproject/providers'
import { Address } from '@pragma-web-utils/core'
import { ethers } from 'ethers'

export function getContract<C extends ethers.Contract>(
  rpcUrlOrProvider: string | ExternalProvider,
  contractInterface: ContractInterface,
  address: Address,
): C {
  const provider =
    typeof rpcUrlOrProvider === 'string'
      ? new ethers.providers.JsonRpcProvider(rpcUrlOrProvider)
      : new ethers.providers.Web3Provider(rpcUrlOrProvider).getSigner()

  return new ethers.Contract(address.toHex(), contractInterface, provider) as C
}
