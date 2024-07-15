import { Address, TvmChainIdsEnum } from '@pragma-web-utils/core'
import { RequestArguments } from 'web3-core'
import { NetworkDetails, TronListener, TronProvider } from '../types'
import { BaseConnector, ConnectResultEnum } from './BaseConnector' // for connectors that extends ethereum as provider

export class TronConnector extends BaseConnector<TronProvider | null> {
  protected _provider: TronProvider | null = null

  constructor(supportedNetworks: NetworkDetails[], defaultChainId: number, activeChainId: number[] = []) {
    super(supportedNetworks, defaultChainId, activeChainId)
  }

  async connect(chainId?: number): Promise<ConnectResultEnum> {
    // if already connected just emit current state notification for all listeners
    if (this.isConnected) {
      this.emitEvent()
      return ConnectResultEnum.ALREADY_CONNECTED
    }

    try {
      this._provider = this.getTronProvider()
    } catch (e) {
      console.warn('Not found tron provider', e)
      this.emitEvent()
      return ConnectResultEnum.FAIL
    }
    if (!this._provider) {
      this.emitEvent()
      return ConnectResultEnum.FAIL
    }

    // subscribe on ethereum events
    if (this.isProviderListenersSupported()) {
      this._provider.on('disconnect', this._onDisconnect as TronListener)
      this._provider.on('chainChanged', this._onChangeChainId as TronListener)
      this._provider.on('accountsChanged', this._onChangeAccount as TronListener)
    }

    // indicate connecting as 'in progress' and try to set account and chainId
    this._isActivating = true
    this.emitEvent()
    try {
      const requestedAccount = await this.requestCurrentAccount()
      const currentChainId = this.getCurrentChainId()
      this._isActivating = false

      if (!requestedAccount || !currentChainId) {
        this.disconnect()
        return ConnectResultEnum.FAIL
      }
      this._account = requestedAccount
      this._chainId = currentChainId
      this.emitEvent()

      // if current chainId is not default try switch network
      if (!!chainId && this.activeChainIds.includes(chainId) && chainId !== this.chainId) {
        this.switchNetwork(chainId)
      } else if (!this.chainId || !this.activeChainIds.includes(this.chainId)) {
        this.switchNetwork(this.defaultChainId)
      }

      return ConnectResultEnum.SUCCESS
    } catch (e) {
      this._isActivating = false
      this.disconnect()
      return ConnectResultEnum.FAIL
    }
  }

  async disconnect(): Promise<void> {
    this._onDisconnect()
  }

  async switchNetwork(chainId: number = this.defaultChainId): Promise<void> {
    const formattedChainId = `0x${chainId.toString(16)}`
    await this._provider?.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: formattedChainId }] })
  }

  async setupNetwork(): Promise<void> {
    throw new Error('Tron not support setup network')
  }

  getProvider(): TronProvider | null {
    return this._provider
  }

  protected getTronProvider(): TronProvider | null {
    const tronProvider = (global as { tron?: TronProvider }).tron
    return tronProvider ? tronProvider : this.getCustomTronProvider()
  }

  protected getCustomTronProvider(): TronProvider | null {
    const tronWeb = (global as { tronWeb?: TronProvider['tronWeb'] }).tronWeb
    return {
      isCustom: true,
      tronWeb: tronWeb ?? false,
      on: () => null,
      removeListener: () => null,
      request: (args: RequestArguments) => {
        if (!tronWeb) {
          throw new Error('Tron not connected')
        }

        return tronWeb.request(args)
      },
    }
  }

  protected isProviderListenersSupported(): boolean {
    // for mobile applications change chainId or wallet reload page, and listening changes not required
    return !!this._provider && !this._provider.isTokenPocket && !this._provider.isCustom
  }
  protected async requestCurrentAccount(): Promise<Address | null> {
    if (!this._provider) {
      return null
    }

    try {
      const requestAccounts = await this._provider.request<string[] | null>({ method: 'eth_requestAccounts' })
      if (requestAccounts) {
        return requestAccounts[0] ? Address.from(requestAccounts[0]) : null
      }
    } catch {
      // handle if eth_requestAccounts not supported
    }

    const defaultAddress = this._provider?.tronWeb ? this._provider.tronWeb.defaultAddress : false
    return defaultAddress ? Address.from(defaultAddress.base58) : null
  }

  protected getCurrentChainId(): number | null {
    const fullNode = this._provider?.tronWeb ? this._provider.tronWeb.fullNode : false
    const host = fullNode ? fullNode.host : ''
    switch (host) {
      case 'https://api.trongrid.io':
      case 'https://api.tronstack.io':
      case 'https://trx.mytokenpocket.vip':
        return TvmChainIdsEnum.MAINNET
      case 'https://api.shasta.trongrid.io':
        return TvmChainIdsEnum.SHASTA
      case 'https://event.nileex.io':
        return TvmChainIdsEnum.NILE
      default:
        return null
    }
  }

  // unsubscribe from all ethereum events and clear state
  protected _onDisconnect = async (error?: { code: number; [key: string]: unknown }): Promise<void> => {
    error && console.error(error)

    this._chainId = undefined
    this._account = undefined
    this.emitEvent()
    this.completeListeners()

    if (this.isProviderListenersSupported()) {
      this._provider?.removeListener('disconnect', this._onDisconnect as TronListener)
      this._provider?.removeListener('chainChanged', this._onChangeChainId as TronListener)
      this._provider?.removeListener('accountsChanged', this._onChangeAccount as TronListener)
    }
  }

  protected _onChangeChainId = ({ chainId }: { chainId: string | number }): void => {
    this._chainId = +chainId
    this.emitEvent()
  }

  protected _onChangeAccount = ([_account]: string[]): void => {
    this._account = _account ? Address.from(_account) : undefined
    this._isActivating = false

    this.emitEvent()
  }
}
