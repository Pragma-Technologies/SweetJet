import { BigNumber, ethers } from 'ethers'

export type BN = BigNumber
export type BNish = BigNumber | string | number

export function fromBNish(amount: BNish): BigNumber {
  return BigNumber.from(amount)
}

export function fromDecimals(amount: string, decimals: number): BigNumber {
  const _amount = amount.trim()
  return ethers.utils.parseUnits(_amount === '' ? '0' : _amount, decimals)
}

export function getMaxIntValue(decimals: number): BigNumber {
  return fromDecimals(Number.MAX_SAFE_INTEGER.toFixed(), decimals)
}
