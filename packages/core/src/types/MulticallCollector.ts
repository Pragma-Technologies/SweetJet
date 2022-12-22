import { BigNumber, ethers } from 'ethers'
import { ConnectorBaseEnum } from '../../../types/dist'
import { Address } from '../classes'

export type AbiDataTypes =
  | 'string'
  | 'address'
  | 'bool'
  | 'bytes'
  | 'bytes4'
  | 'bytes32'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint96'
  | 'uint128'
  | 'uint136'
  | 'uint240'
  | 'uint256'
export type AbiDataTypesArray<T extends AbiDataTypes | 'tuple' = AbiDataTypes | 'tuple'> = `${T}[]`

export type OutputPrimitiveTypes = AbiDataTypes | AbiDataTypesArray<AbiDataTypes>
export type OutputTupleTypes = 'tuple' | AbiDataTypesArray<'tuple'>
export type OutputTypes = OutputTupleTypes | OutputPrimitiveTypes

export interface OutputPrimitive<T extends OutputPrimitiveTypes = OutputPrimitiveTypes> {
  internalType: string
  name: string
  type: T
}

export interface OutputTuple<T extends OutputTupleTypes = OutputTupleTypes> {
  components: Output[]
  internalType: string
  name: string
  type: T
}

export type Output<T extends OutputTypes = OutputTypes> = T extends OutputTupleTypes
  ? OutputTuple<T>
  : T extends OutputPrimitiveTypes
  ? OutputPrimitive<T>
  : never

export type UnwrapAbiDataTypes<T extends AbiDataTypes> = T extends 'string'
  ? string
  : T extends 'address'
  ? string
  : T extends 'bool'
  ? boolean
  : T extends 'bytes' | 'bytes4' | 'bytes32'
  ? string
  : T extends 'uint8' | 'uint16'
  ? number
  : T extends 'uint32' | 'uint64' | 'uint96' | 'uint128' | 'uint136' | 'uint240' | 'uint256'
  ? BigNumber
  : never

export type UnwrapOutputTuple<T extends OutputTuple> = T['type'] extends 'tuple[]'
  ? UnwrapOutputs<T['components']>[]
  : UnwrapOutputs<T['components']>

export type UnwrapOutputPrimitiveItem<T> = T extends AbiDataTypes ? UnwrapAbiDataTypes<T> : never
export type UnwrapOutputPrimitive<T extends OutputPrimitive> = T['type'] extends AbiDataTypesArray<infer I>
  ? UnwrapOutputPrimitiveItem<I>[]
  : UnwrapOutputPrimitiveItem<T['type']>

export type UnwrapOutput<T extends Output> = T extends Output<OutputTupleTypes>
  ? UnwrapOutputTuple<T>
  : T extends Output<OutputPrimitiveTypes>
  ? UnwrapOutputPrimitive<T>
  : never

export type UnwrapOutputsTuple<T extends [...Output[]]> = T extends [infer Head, ...infer Tail]
  ? Head extends Output
    ? Tail extends Output[]
      ? [UnwrapOutput<Head>, ...UnwrapOutputsTuple<Tail>]
      : []
    : []
  : []

export type UnwrapOutputsArray<T extends Output[]> = T extends (infer I)[]
  ? I extends Output
    ? UnwrapOutput<I>[]
    : never
  : never

export type UnwrapOutputs<T extends [...Output[]] | Output[]> = T extends [Output, ...Output[]]
  ? UnwrapOutputsTuple<T>
  : T extends Output[]
  ? UnwrapOutputsArray<T>
  : never

export type UnwrapCallOption<T extends CallOption> = UnwrapOutputs<T['callInfo']['output']>

export interface CallInfo<T extends [...Output[]] | Output[] = [...Output[]]> {
  scInterface: ethers.utils.Interface
  method: string
  values: unknown[]
  output: T
  target: Address
}

export interface CallOption<T extends [...Output[]] | Output[] = [...Output[]]> {
  callInfo: CallInfo<T>
  contractAddress: Address
  rpcUrl: string
  base: ConnectorBaseEnum
}

export interface MulticallOptions {
  callInfos: CallInfo[]
  contractAddress: Address
  rpcUrl: string
}
