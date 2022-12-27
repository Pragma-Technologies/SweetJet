import { abiERC20 } from '@pragma-web-utils/contract-utils'
import { BigNumber, ethers } from 'ethers'
import { toHex } from 'tron-format-address'
import { ConnectorBaseEnum } from '../enums'
import {
  CallOption,
  CurrencyBalanceId,
  CurrencyBalanceSetup,
  CurrencyId,
  CurrencyInfo,
  CurrencySetup,
  CurrencyStorage,
  MulticallNetworkInfo,
  NetworkId,
} from '../types'
import { Address } from './Address'
import { MulticallRequestCollector } from './MulticallRequestCollector'

function getNetworkId(network: { base: ConnectorBaseEnum; chainId: string | number }): NetworkId {
  return `${network.base}_${network.chainId}`
}

function getCurrencyId(currency: CurrencySetup): CurrencyId {
  return `${currency.base}_${currency.chainId}_${currency.address}`
}

function getCurrencyBalanceId(currency: CurrencyBalanceSetup, account: string): CurrencyBalanceId {
  return `${currency.base}_${currency.chainId}_${currency.address}_${account}`
}

export class CurrencyService {
  protected _scInterface = new ethers.utils.Interface(abiERC20)
  protected _storage: CurrencyStorage = {
    currencyInfoMap: new Map<CurrencyId, Readonly<CurrencyInfo>>(),
    balanceInfoMap: new Map<CurrencyBalanceId, BigNumber>(),
  }
  protected _supportedNetworks = new Map<NetworkId, MulticallNetworkInfo>()

  constructor(protected _multicallCollector: MulticallRequestCollector, supportedNetworks: MulticallNetworkInfo[]) {
    supportedNetworks.forEach((network) => this._supportedNetworks.set(getNetworkId(network.network), network))
  }

  async getCurrencyInfo(setup: CurrencySetup[]): Promise<Readonly<CurrencyInfo>[]> {
    return Promise.all(setup.map((info) => this._getCurrencyInfo(info)))
  }

  async getCurrencyBalance(setup: CurrencyBalanceSetup[], account: string): Promise<BigNumber[]> {
    return Promise.all(setup.map((info) => this._getCurrencyBalance(info, account)))
  }

  async getUpdatedCurrencyBalance(setup: CurrencyBalanceSetup[], account: string): Promise<BigNumber[]> {
    return Promise.all(setup.map((info) => this._loadCurrencyBalance(info, account)))
  }

  protected async _getCurrencyInfo(setup: CurrencySetup): Promise<Readonly<CurrencyInfo>> {
    const stored = this._storage.currencyInfoMap.get(getCurrencyId(setup))
    return stored || this._loadCurrencyInfo(setup)
  }

  protected async _loadCurrencyInfo(setup: CurrencySetup): Promise<Readonly<CurrencyInfo>> {
    if (setup.isNative) {
      this._storage.currencyInfoMap.set(getCurrencyId(setup), setup)
      return setup
    }
    const networkInfo = this._supportedNetworks.get(getNetworkId(setup))

    if (!networkInfo) {
      throw new Error(`Not supported chainId: ${setup.chainId}`)
    }

    const { multicall, network } = networkInfo

    const requestSetup: Omit<CallOption, 'callInfo'> = {
      contractAddress: new Address(multicall),
      base: network.base,
      rpcUrl: network.base === ConnectorBaseEnum.EVM ? network.rpcUrl : network.grpcUrl,
    }
    const target = new Address(setup.address)

    const _name = this._multicallCollector.request({
      ...requestSetup,
      callInfo: {
        scInterface: this._scInterface,
        method: 'name',
        values: [],
        output: [{ type: 'string', name: '', internalType: 'string' }],
        target,
      },
    })
    const _symbol = this._multicallCollector.request({
      ...requestSetup,
      callInfo: {
        scInterface: this._scInterface,
        method: 'symbol',
        values: [],
        output: [{ type: 'string', name: '', internalType: 'string' }],
        target,
      },
    })
    const _decimals = this._multicallCollector.request({
      ...requestSetup,
      callInfo: {
        scInterface: this._scInterface,
        method: 'decimals',
        values: [],
        output: [{ type: 'uint8', name: '', internalType: 'uint8' }],
        target,
      },
    })
    const [[name], [symbol], [decimals]] = await Promise.all([_name, _symbol, _decimals])
    const loaded = { ...setup, name, symbol, decimals }
    this._storage.currencyInfoMap.set(getCurrencyId(setup), loaded)
    return loaded
  }

  protected async _getCurrencyBalance(setup: CurrencyBalanceSetup, account: string): Promise<BigNumber> {
    const stored = this._storage.balanceInfoMap.get(getCurrencyBalanceId(setup, account))
    return stored || this._loadCurrencyBalance(setup, account)
  }

  protected async _loadCurrencyBalance(setup: CurrencyBalanceSetup, account: string): Promise<BigNumber> {
    const networkInfo = this._supportedNetworks.get(getNetworkId(setup))

    if (!networkInfo) {
      throw new Error(`Not supported chainId: ${setup.chainId}`)
    }

    const { multicall, network } = networkInfo
    const target = setup.base === ConnectorBaseEnum.TVM ? toHex(setup.address) : setup.address

    const [_balance] = await this._multicallCollector.request({
      contractAddress: new Address(multicall),
      base: network.base,
      rpcUrl: network.base === ConnectorBaseEnum.EVM ? network.rpcUrl : network.grpcUrl,
      callInfo: {
        scInterface: this._scInterface,
        method: 'balanceOf',
        values: [account],
        output: [{ type: 'uint256', name: '', internalType: 'uint256' }],
        target: new Address(target),
      },
    })

    const balance = BigNumber.from(_balance)
    this._storage.balanceInfoMap.set(getCurrencyBalanceId(setup, account), balance)
    return balance
  }
}
