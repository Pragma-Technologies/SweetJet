import { Address, LimitedTronWeb, TvmChainIdsEnum } from '@pragma-web-utils/core'
import { RequestArguments } from 'web3-core'
import { CancelError, isCancelError, SignatureError } from '../errors'
import { TronListener, TronProvider } from '../types'
import { BaseConnector, ConnectResultEnum } from './BaseConnector' // for connectors that extends ethereum as provider

export class TronConnector extends BaseConnector<TronProvider | null> {
  protected _provider: TronProvider | null = null

  constructor(defaultChainId: number) {
    super([], defaultChainId, [TvmChainIdsEnum.MAINNET, TvmChainIdsEnum.SHASTA, TvmChainIdsEnum.NILE])
  }

  async signMessage(message: string): Promise<string> {
    const tronWeb = this._provider?.tronWeb
    if (!tronWeb || !this.account) {
      throw new Error('Tron not connected')
    }
    return !tronWeb.trx.signMessageV2
      ? this._signMessageV1(tronWeb, this.account, message)
      : this._signMessageV2(tronWeb, this.account, message)
  }

  async connect(chainId?: number): Promise<ConnectResultEnum> {
    // if already connected just emit current state notification for all listeners
    if (this.isConnected) {
      this.emitEvent()
      return ConnectResultEnum.ALREADY_CONNECTED
    }

    try {
      this._provider = this._getTronProvider()
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
    if (this._isProviderListenersSupported()) {
      this._provider.on('disconnect', this._onDisconnect as TronListener)
      this._provider.on('chainChanged', this._onChangeChainId as TronListener)
      this._provider.on('accountsChanged', this._onChangeAccount as TronListener)
    }

    // indicate connecting as 'in progress' and try to set account and chainId
    this._isActivating = true
    this.emitEvent()
    try {
      const requestedAccount = await this._requestCurrentAccount()
      this._account = requestedAccount ?? undefined
      this._isActivating = false
      if (!this.account) {
        this.disconnect()
        return ConnectResultEnum.FAIL
      }
      const currentChainId = await this._getCurrentChainId()
      if (!!currentChainId) {
        this._chainId = currentChainId
        this.emitEvent()
      }

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

  protected _getTronProvider(): TronProvider | null {
    const tronProvider = (global as { tron?: TronProvider }).tron
    return tronProvider ? tronProvider : this._getCustomTronProvider()
  }

  protected _getCustomTronProvider(): TronProvider | null {
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

  protected _isProviderListenersSupported(): boolean {
    // for mobile applications change chainId or wallet reload page, and listening changes not required
    return !!this._provider && !this._provider.isTokenPocket && !this._provider.isCustom
  }

  protected async _requestCurrentAccount(): Promise<Address | null> {
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

    const tronWeb = this._provider?.tronWeb ? this._provider.tronWeb : null
    await tronWeb?.request({ method: 'tron_requestAccounts' })
    const defaultAddress = this._provider?.tronWeb ? this._provider.tronWeb.defaultAddress : false
    return defaultAddress ? Address.from(defaultAddress.base58) : null
  }

  protected async _getCurrentChainId(): Promise<number | null> {
    const CHAIN_ID_WAIT_DURATION = 60 * 1000 // wait changes about 60 seconds
    const CHAIN_ID_PING_DURATION = 100 // check changes every 100 milliseconds

    // workaround, on manually disconnecting TronLink, needs to wait some time for get current chainId
    let chainIdResolver: (chainId: number | null) => void
    const chainIdPromise = new Promise<number | null>((resolver) => {
      chainIdResolver = resolver
    })

    const startTimestamp = Date.now()
    const checkChainId = (): void => {
      const fullNode = this._provider?.tronWeb ? this._provider.tronWeb.fullNode : false
      const host = fullNode ? fullNode.host : ''
      switch (host) {
        case 'https://api.trongrid.io':
        case 'https://api.tronstack.io':
        case 'https://trx.mytokenpocket.vip':
          return chainIdResolver(TvmChainIdsEnum.MAINNET)
        case 'https://api.shasta.trongrid.io':
          return chainIdResolver(TvmChainIdsEnum.SHASTA)
        case 'https://event.nileex.io':
          return chainIdResolver(TvmChainIdsEnum.NILE)
        default:
          return Date.now() - startTimestamp < CHAIN_ID_WAIT_DURATION
            ? void setTimeout(checkChainId, CHAIN_ID_PING_DURATION)
            : chainIdResolver(null)
      }
    }
    checkChainId()
    return chainIdPromise
  }

  // unsubscribe from all ethereum events and clear state
  protected _onDisconnect = async (error?: { code: number; [key: string]: unknown }): Promise<void> => {
    error && console.error(error)

    this._chainId = undefined
    this._account = undefined
    this.emitEvent()
    this.completeListeners()

    if (this._isProviderListenersSupported()) {
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

  protected async _signMessageV1(tronWeb: LimitedTronWeb, account: Address, message: string): Promise<string> {
    try {
      const _message = message.startsWith('0x') ? message : tronWeb.toHex(message)
      let signature = await tronWeb.trx.sign(_message)
      signature = signature.replace(/^0x/, '')
      const tail = signature.substring(128, 130)
      if (tail == '01') {
        signature = signature.substring(0, 128) + '1c'
      } else if (tail == '00') {
        signature = signature.substring(0, 128) + '1b'
      }
      const result = await tronWeb.trx.verifyMessage(_message, signature, account.toBase58())
      if (!result) {
        throw new SignatureError(message, account.toBase58(), signature, 'sign', tronWeb.version)
      }
      return signature
    } catch (e) {
      if (isCancelError(e)) {
        throw new CancelError('sign')
      }

      throw e
    }
  }

  protected async _signMessageV2(tronWeb: LimitedTronWeb, account: Address, message: string): Promise<string> {
    try {
      const signature = await tronWeb.trx.signMessageV2(message)
      const result = await tronWeb.trx.verifyMessageV2(message, signature)
      if (result !== account.toBase58()) {
        throw new SignatureError(message, account.toBase58(), signature, 'signMessageV2', tronWeb.version)
      }
      return signature
    } catch (e) {
      if (isCancelError(e)) {
        throw new CancelError('signMessageV2')
      } else {
        return this._signMessageV1(tronWeb, account, message)
      }
    }
  }
}
