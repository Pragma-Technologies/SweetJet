import { Address } from '@pragma-web-utils/core'
import { ethers } from 'ethers'
import { stringToHex } from '../utils'
import { CancelError, isCancelError, SignatureError } from '../errors'
import { EthereumListener, EthereumProvider, NetworkDetails } from '../types'
import { BaseConnector, ConnectResultEnum } from './BaseConnector'

// for connectors that extends ethereum as provider
export abstract class EthereumConnector<T extends EthereumProvider = EthereumProvider> extends BaseConnector<T | null> {
  protected _provider: T | null = null
  protected _network_not_exist_error_codes: number[] = [4902]

  public async signMessage(message: string): Promise<string> {
    if (!this._provider || !this.account) {
      throw new Error('Provider not connected')
    }
    try {
      const params = [stringToHex(message), this.account.toHex()]
      const account = this.account
      const signature = await this._provider.request<string>({ method: 'personal_sign', params })
      const validatedAccount = ethers.utils.verifyMessage(message, signature)
      if (account.toHex().toLowerCase() !== validatedAccount.toLowerCase()) {
        throw new SignatureError(message, account.toHex(), signature, 'personal_sign', 'unknown')
      }
      return signature
    } catch (e) {
      if (isCancelError(e)) {
        throw new CancelError('personal_sign')
      }

      throw e
    }
  }

  async connect(chainId?: number): Promise<ConnectResultEnum> {
    // if already connected just emit current state notification for all listeners
    if (this.isConnected) {
      this.emitEvent()
      return ConnectResultEnum.ALREADY_CONNECTED
    }

    try {
      this._provider = await this.getEthereumProvider()
    } catch (e) {
      console.warn('Not found ethereum provider', e)
      return ConnectResultEnum.FAIL
    }
    if (!this._provider) {
      return ConnectResultEnum.FAIL
    }
    // subscribe on ethereum events
    this._provider.on('connect', this._onConnect as EthereumListener)
    this._provider.on('disconnect', this._onDisconnect as EthereumListener)
    this._provider.on('chainChanged', this._onChangeChainId as EthereumListener)
    this._provider.on('accountsChanged', this._onChangeAccount as EthereumListener)

    // indicate connecting as 'in progress' and try to set account and chainId
    this._isActivating = true
    this.emitEvent()
    try {
      const requestedAccounts = await this._provider.request<string[]>({ method: 'eth_requestAccounts' })
      this._onChangeAccount(requestedAccounts)
      if (!this.account) {
        this._isActivating = false
        this.disconnect()
        return ConnectResultEnum.FAIL
      }
      const currentChainId = await this._provider.request<string>({ method: 'eth_chainId' })
      this._onChangeChainId(currentChainId)

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
    try {
      const formattedChainId = `0x${chainId.toString(16)}`
      await this._provider?.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: formattedChainId }] })
    } catch (error) {
      const networkDetails = this.supportedNetworks.find((item) => item.chainId === chainId)
      const code = !!error && (error as { code?: unknown }).code
      if (this._network_not_exist_error_codes.includes(code as number) && networkDetails) {
        await this.setupNetwork(networkDetails)
      } else {
        throw error
      }
    }
  }

  async setupNetwork({ chainId, rpc, ...networkDetails }: NetworkDetails): Promise<void> {
    if (!this._supportedNetworks.some((item) => item.chainId === chainId)) {
      this._supportedNetworks = [...this._supportedNetworks, { ...networkDetails, chainId, rpc }]
      this._activeChainIds = [...this._activeChainIds, chainId]
    }
    const formattedChainId = `0x${chainId.toString(16)}`
    const params = { ...networkDetails, chainId: formattedChainId, rpcUrls: [rpc] }
    await this._provider?.request({ method: 'wallet_addEthereumChain', params: [params] })
  }

  getProvider(): T | null {
    return this._provider
  }

  protected abstract getEthereumProvider(): Promise<T | null>

  /* listeners defined as arrow function for save `this` when set as ethereum listener  */
  protected _onConnect = ({ chainId }: { chainId: string }): void => {
    this._chainId = +chainId
    this._isActivating = false
  }

  // unsubscribe from all ethereum events and clear state
  protected _onDisconnect = async (error?: { code: number; [key: string]: unknown }): Promise<void> => {
    // ignore if disconnection was by EthereumProvider inner bug
    if (error?.code === 1013) {
      return
    }

    error && console.error(error)

    this._chainId = undefined
    this._account = undefined
    this.emitEvent()
    this.completeListeners()
    this._provider?.removeListener('connect', this._onConnect as EthereumListener)
    this._provider?.removeListener('disconnect', this._onDisconnect as EthereumListener)
    this._provider?.removeListener('chainChanged', this._onChangeChainId as EthereumListener)
    this._provider?.removeListener('accountsChanged', this._onChangeAccount as EthereumListener)
  }

  protected _onChangeChainId = (chainId: string): void => {
    this._chainId = +chainId
    this.emitEvent()
  }

  protected _onChangeAccount = ([account]: string[]): void => {
    this._account = account ? Address.from(account) : undefined
    this._isActivating = false

    this.emitEvent()
  }
}
