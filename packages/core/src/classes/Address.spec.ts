import { Address } from './Address'
import { EMPTY_ADDRESS } from '../constants/common'
import * as AddressFormatter from 'tron-format-address'
import { fromHex, toHex } from 'tron-format-address'

const hexAddress_1 = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const base58Address_1 = 'TTfP4dtqSpxK5z3DXPmhFEd9f8SDe3JoyQ'

const hexAddress_2 = '0xE8f9E07EDFEacdd2909a1022547e395a729F9c72'
const base58Address_2 = 'TXD57KNTJ6zyGCk7aHs48FUemx4j2BDXLj'

describe('Address class', () => {
  it('init by ethereum hex format', () => {
    const address_1 = new Address(hexAddress_1)
    const address_2 = new Address(hexAddress_2)
    const empty_address = new Address()

    expect(address_1.toHex()).toEqual(hexAddress_1)
    expect(address_1.toBase58()).toEqual(base58Address_1)
    expect(address_2.toHex()).toEqual(hexAddress_2)
    expect(address_2.toBase58()).toEqual(base58Address_2)
    expect(empty_address.toHex()).toEqual(EMPTY_ADDRESS)
    expect(empty_address.toBase58()).toEqual(fromHex(EMPTY_ADDRESS))
  })

  it('init by tron base58 format', () => {
    const address_1 = new Address(base58Address_1)
    const address_2 = new Address(base58Address_2)
    const empty_address = new Address()

    expect(address_1.toHex()).toEqual(hexAddress_1)
    expect(address_1.toBase58()).toEqual(base58Address_1)
    expect(address_2.toHex()).toEqual(hexAddress_2)
    expect(address_2.toBase58()).toEqual(base58Address_2)
    expect(empty_address.toHex()).toEqual(EMPTY_ADDRESS)
    expect(empty_address.toBase58()).toEqual(fromHex(EMPTY_ADDRESS))
  })

  it('check toString method implementation', () => {
    const address_1 = new Address(hexAddress_1)
    const _address_1 = new Address(base58Address_1)

    expect(address_1.toString()).toEqual(hexAddress_1)
    expect(_address_1.toString()).toEqual(hexAddress_1)
  })

  // get formatted value once and store it for next calls
  it('check format count', () => {
    const _toHex = jest.spyOn(AddressFormatter, 'toHex')
    const _fromHex = jest.spyOn(AddressFormatter, 'fromHex')

    const address_1 = new Address(hexAddress_1)

    address_1.toHex()
    expect(_toHex).toBeCalledTimes(0)
    expect(_fromHex).toBeCalledTimes(0)

    address_1.toBase58()
    expect(_toHex).toBeCalledTimes(0)
    expect(_fromHex).toBeCalledTimes(1)

    address_1.toBase58()
    expect(_toHex).toBeCalledTimes(0)
    expect(_fromHex).toBeCalledTimes(1)

    const address_2 = new Address(base58Address_2)

    address_2.toHex()
    expect(_toHex).toBeCalledTimes(1)
    expect(_fromHex).toBeCalledTimes(1)

    address_2.toBase58()
    expect(_toHex).toBeCalledTimes(1)
    expect(_fromHex).toBeCalledTimes(1)

    address_2.toBase58()
    expect(_toHex).toBeCalledTimes(1)
    expect(_fromHex).toBeCalledTimes(1)
  })
})
