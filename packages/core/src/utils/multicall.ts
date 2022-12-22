import { JsonRpcProvider } from '@ethersproject/providers'
import { getEvmMulticallContract } from '@pragma-web-utils/contract-utils'
import { AbiCoder } from 'ethers/lib/utils'
import { Address } from '../classes'
import { MulticallCaller } from '../types'
import { encodeParams } from './encodeUtils'

export const getEvmMulticallCaller = (contractAddress: string, rpcUrl: string): MulticallCaller => {
  const provider = new JsonRpcProvider(rpcUrl)
  const contract = getEvmMulticallContract(contractAddress, provider)
  return (targets, values) => contract.functions.aggregate(targets, values)
}

export const getTvmMulticallCaller = (contractAddress: Address, rpcUrl: string): MulticallCaller => {
  return async (targets, values) => {
    const parameter = encodeParams([
      { type: 'address[]', value: targets },
      { type: 'bytes[]', value: values },
    ])

    const url = `${rpcUrl}wallet/triggerconstantcontract`
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        owner_address: new Address().toBase58(),
        contract_address: contractAddress.toBase58(),
        function_selector: 'aggregate(address[],bytes[])',
        parameter,
        visible: true,
      }),
    })
    const {
      constant_result: [data],
    } = await response.json()

    const abiCoder = new AbiCoder()
    return abiCoder.decode(['bytes[]'], `0x${data}`) as [string[]]
  }
}
