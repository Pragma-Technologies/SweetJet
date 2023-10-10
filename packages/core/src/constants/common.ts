import { BigNumber } from 'ethers'
import { fromHex } from 'tron-format-address'

export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'
export const TRON_EMPTY_ADDRESS = fromHex(EMPTY_ADDRESS)

export const ADDRESS_PREFIX_REGEX = /^(41)/
export const MAX_TRON_MULTICALL_COUNT = 5

export const ZERO_BN = BigNumber.from('0')
