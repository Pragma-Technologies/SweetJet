import { BigNumber } from 'ethers'
import { EMPTY_ADDRESS } from '../constants'
import { encodeParams } from './encodeUtils'

const _address = EMPTY_ADDRESS
const _bn = BigNumber.from('1000')
const _string = 'Hello World'
const addressData = { type: 'address', value: _address }
const bnData = { type: 'uint256', value: _bn }
const stringData = { type: 'string', value: _string }
const tupleData = { type: 'tuple(uint256,address)', value: [_bn, _address] }
const tupleData2 = { type: 'tuple(uint256,address,string)', value: [_bn, _address, _string] }
const stringArrayData = { type: 'string[]', value: [_string, _string] }

const addressEncodedData = '0000000000000000000000000000000000000000000000000000000000000000'
const bnEncodedData = '00000000000000000000000000000000000000000000000000000000000003e8'
const stringEncodedData =
  '000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'

const defaultOffset = '0000000000000000000000000000000000000000000000000000000000000020'

describe('encodeParams function', () => {
  it('check single values', () => {
    expect(encodeParams([addressData])).toBe(addressEncodedData)
    expect(encodeParams([bnData])).toBe(bnEncodedData)
    expect(encodeParams([stringData])).toBe(defaultOffset + stringEncodedData)
    expect(encodeParams([bnData, addressData])).toBe(bnEncodedData + addressEncodedData)
  })
  it('check tuples', () => {
    expect(encodeParams([tupleData])).toBe(bnEncodedData + addressEncodedData)
    expect(encodeParams([tupleData2])).toBe(
      defaultOffset +
        bnEncodedData +
        addressEncodedData +
        '0000000000000000000000000000000000000000000000000000000000000060' + // string offset prefix ??
        stringEncodedData,
    )
    expect(encodeParams([stringArrayData])).toBe(
      defaultOffset +
        '0000000000000000000000000000000000000000000000000000000000000002' + // array size ??
        '0000000000000000000000000000000000000000000000000000000000000040' + // first string offset
        '0000000000000000000000000000000000000000000000000000000000000080' + // second string offset
        stringEncodedData +
        stringEncodedData,
    )
  })
  it('check arrays', () => {
    expect(encodeParams([stringArrayData])).toBe(
      defaultOffset +
        '0000000000000000000000000000000000000000000000000000000000000002' + // array size ??
        '0000000000000000000000000000000000000000000000000000000000000040' + // first string offset
        '0000000000000000000000000000000000000000000000000000000000000080' + // second string offset
        stringEncodedData +
        stringEncodedData,
    )
  })
})
