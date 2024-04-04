/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AbiCoder } from 'ethers/lib/utils'
import { ADDRESS_PREFIX_REGEX } from '../constants'
import { ConnectorBaseEnum } from '../enums'
import {
  CallInfo,
  CallOption,
  MulticallOptions,
  Output,
  OutputTuple,
  UnwrapCallOption,
  UnwrapOutput,
  UnwrapOutputs,
} from '../types'
import { getEvmMulticallCaller, getTvmMulticallCaller } from '../utils'
import { ObservableSubject } from './ObservableSubject'

export class MulticallRequestCollector {
  protected _needCollection = false
  protected _requestQueue = new Map<string, { requestOptions: CallOption; key: string }[]>()
  protected _requestListener = new ObservableSubject()

  constructor(protected _maxEnergyPerCall = 5_000, protected _defaultCallEnergy = 1_000) {}

  public setMaxEnergyPerCall(value: number) {
    this._maxEnergyPerCall = value
  }

  public setDefaultCallEnergy(value: number) {
    this._defaultCallEnergy = value
  }

  // TODO: add check for this rule
  // multicall contract address and base for all request should be same for each rpcUrl
  async request<T extends CallOption>(requestOptions: T): Promise<UnwrapCallOption<T>> {
    const { callInfo, rpcUrl, contractAddress, base } = requestOptions
    const { target, output, values, method } = callInfo
    const internalTypes = output.map(({ internalType }) => internalType)

    const key = `${rpcUrl}_${contractAddress}_${target}_${method}_${internalTypes}_${values}_${base}`

    const requestData = { key, requestOptions }
    const relatedQueue = this._requestQueue.get(requestOptions.rpcUrl) ?? []
    relatedQueue.push(requestData)
    this._requestQueue.set(requestOptions.rpcUrl, relatedQueue)

    return new Promise((resolve, reject) => {
      const subscription = this._requestListener.listen(key, {
        next: (data: unknown) => {
          resolve(data as UnwrapCallOption<T>)
          subscription.unsubscribe()
        },
        error: reject,
      })
      if (!this._needCollection) {
        this._needCollection = true
        // set it as last in task queue
        setTimeout(() => this._collectRequests())
      }
    })
  }

  protected _collectRequests(): void {
    this._requestQueue.forEach(async (data, rpcUrl) => {
      const callInfos = data.map(({ requestOptions: { callInfo } }) => callInfo)
      const { contractAddress, base } = data[0].requestOptions
      const _keys = data.map(({ key }) => key)
      try {
        const options = { base, rpcUrl, contractAddress, callInfos }
        const responses = this._multicall(options, _keys)
        responses.map(async ({ keys, results }) => {
          try {
            ;(await results).forEach((response, index) =>
              response === '0x'
                ? this._requestListener.sendError(keys[index], 'Failed request')
                : this._requestListener.sendValue(keys[index], response),
            )
          } catch (err) {
            keys.forEach((key) => this._requestListener.sendError(key, err))
          }
        })
      } catch (err) {
        _keys.forEach((key) => this._requestListener.sendError(key, err))
      }
    })
    this._requestQueue.clear()
    this._needCollection = false
  }

  protected _multicall(
    { callInfos, contractAddress, rpcUrl, base }: MulticallOptions,
    keys: string[],
  ): { keys: string[]; results: Promise<unknown[]> }[] {
    const caller =
      base === ConnectorBaseEnum.EVM
        ? getEvmMulticallCaller(contractAddress, rpcUrl)
        : getTvmMulticallCaller(contractAddress, rpcUrl)
    const callGroups = this._getGroupedCallInfos(callInfos, keys)

    const requests: { request: Promise<[string[]]>; outputs: [...Output[]][]; keys: string[] }[] = []
    for (const callGroup of callGroups) {
      const targets = callGroup.map(({ callInfo: { target } }) => target.toHex())
      const values = callGroup.map(({ callInfo: { values, scInterface, method } }) =>
        scInterface.encodeFunctionData(method, values),
      )
      const outputs = callGroup.map(({ callInfo: { output } }) => output)
      const _keys = callGroup.map(({ key }) => key)

      requests.push({ request: caller(targets, values), outputs, keys: _keys })
    }

    return requests.map(({ request, outputs, keys }) => ({
      keys,
      results: request.then(([result]) => this._decodeArrayOfParams(outputs, result)),
    }))
  }

  protected _getGroupedCallInfos(callInfos: CallInfo[], keys: string[]): { callInfo: CallInfo; key: string }[][] {
    const energies = callInfos
      .map(({ energy }, index) => ({ energy: energy ?? this._defaultCallEnergy, index }))
      .sort((a, b) => b.energy - a.energy)
    const result: { callInfo: CallInfo; key: string }[][] = []
    let currGroup: { callInfo: CallInfo; key: string }[] = []
    let currGroupEnergy = 0

    for (let energyInfo of energies) {
      if (currGroup.length && currGroupEnergy + energyInfo.energy > this._maxEnergyPerCall) {
        result.push(currGroup)
        currGroup = []
        currGroupEnergy = 0
      }

      currGroup.push({ callInfo: callInfos[energyInfo.index], key: keys[energyInfo.index] })
      currGroupEnergy += energyInfo.energy
    }

    result.push(currGroup)
    return result
  }

  protected _decodeParams<T extends [...Output[]]>(outputs: T, data: string): UnwrapOutputs<T> {
    if (outputs.length && data === '0x') {
      throw new Error('Empty data')
    }

    if (data.replace(/^0x/, '').length % 64) {
      throw new Error('The encoded string is not valid. Its length must be a multiple of 64.')
    }

    const abiCoder = new AbiCoder()

    return fixTupleFields(
      abiCoder.decode(getOutputTypes(outputs), data) as UnwrapOutput<Output>[],
      outputs,
    ) as UnwrapOutputs<T>
  }

  protected _decodeArrayOfParams(types: Output[][], output: string[]): (UnwrapOutputs<Output[]> | '0x')[] {
    return output.map((el, index) => {
      try {
        return this._decodeParams(types[index], el)
      } catch (error) {
        return '0x'
      }
    })
  }
}

export function isOutputTuple(output: Output): output is OutputTuple {
  return output.type === 'tuple' || output.type === 'tuple[]'
}

export function getOutputType(outputs: Output): string {
  return isOutputTuple(outputs)
    ? outputs.type === 'tuple'
      ? `tuple(${getOutputTypes(outputs.components).join()})`
      : `tuple(${getOutputTypes(outputs.components).join()})[]`
    : outputs.type
}

export function getOutputTypes(outputs: Output[]): string[] {
  return outputs.map(getOutputType)
}

const fixTupleFields = <T extends Output>(outputs: UnwrapOutput<Output>[], types: Output[]): UnwrapOutput<T> => {
  const result: unknown[] = []
  outputs.forEach((item, index) => {
    const fieldValue = fixOutput(types[index], item)
    result[index] = fieldValue
    if (types[index].name) {
      // @ts-ignore
      result[types[index].name] = fieldValue
    }
  })
  return result as unknown as UnwrapOutput<T>
}

export function fixOutput<T extends Output>(output: T, data: UnwrapOutput<T>): UnwrapOutput<T> {
  if (isOutputTuple(output)) {
    return output.type === 'tuple'
      ? fixTupleFields<T>(data as UnwrapOutput<Output>[], output.components) // for single tuple
      : ((data as UnwrapOutput<Output>[][]).map((tuple) => fixTupleFields(tuple, output.components)) as UnwrapOutput<T>) // for tuple array
  }

  switch (output.type) {
    case 'address':
      return fixAddress(data as string) as UnwrapOutput<T>
    case 'address[]':
      const addresses = data as string[]
      return addresses.map(fixAddress) as UnwrapOutput<T>
    default:
      return data
  }
}

export function fixAddress(address: string): string {
  return address.replace(ADDRESS_PREFIX_REGEX, '0x')
}
