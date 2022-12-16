/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbiCoder } from 'ethers/lib/utils'
import { ADDRESS_PREFIX_REGEX } from '../constants'

export type FunctionParams = { type: string; value: any }

export function encodeParams(inputs: FunctionParams[]): string {
  let parameters = ''

  if (inputs.length == 0) {
    return parameters
  }
  const abiCoder = new AbiCoder()
  const types = []
  const values = []

  for (let i = 0; i < inputs.length; i++) {
    let { type, value } = inputs[i]
    if (type == 'address') {
      value = value.replace(ADDRESS_PREFIX_REGEX, '0x')
    } else if (type == 'address[]') {
      value = value.map((v: any) => v.toString('hex').replace(ADDRESS_PREFIX_REGEX, '0x'))
    }
    types.push(type)
    values.push(value)
  }

  try {
    parameters = abiCoder.encode(types, values).replace(/^(0x)/, '')
  } catch (ex) {
    console.log(ex)
  }
  return parameters
}
