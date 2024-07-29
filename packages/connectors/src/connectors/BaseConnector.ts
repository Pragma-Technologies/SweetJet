import { Address } from '@pragma-web-utils/core'
import { BaseProvider, ConnectionInfo, Destructor, Listener, NetworkDetails } from '../types'

export enum ConnectResultEnum {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
}

export abstract class BaseConnector<T extends BaseProvider = BaseProvider> {
  protected _chainId: number | undefined

  // make chainId field readonly for getting out of class
  get chainId(): number | undefined {
    return this._chainId
  }

  protected _account: Address | undefined

  // make account field readonly for getting out of class
  get account(): Address | undefined {
    return this._account
  }

  protected _isActivating = false // flag for indicate connecting process

  // make isActivating field readonly for getting out of class
  get isActivating(): boolean {
    return this._isActivating
  }

  // make supportedNetworks field immutable
  get supportedNetworks(): NetworkDetails[] {
    return this._supportedNetworks.map((item) => ({ ...item }))
  }

  set supportedNetworks(value: NetworkDetails[]) {
    this._supportedNetworks = value
    this.emitEvent()
  }

  // make activeChainId field immutable
  get activeChainIds(): number[] {
    return [...this._activeChainIds]
  }

  set activeChainIds(value: number[]) {
    this._activeChainIds = value
    this.emitEvent()
  }

  // if it has connected account and allowed chainId
  get isActive(): boolean {
    if (!this.account) {
      return false
    }
    return !this._activeChainIds.length || this._activeChainIds.some((chainId) => this._chainId === chainId)
  }

  get isConnected(): boolean {
    return !!this.account
  }

  protected _listeners: Listener[] = []

  protected constructor(
    protected _supportedNetworks: NetworkDetails[],
    public defaultChainId: number,
    protected _activeChainIds: number[] = [],
  ) {}

  public abstract signMessage(message: string): Promise<string>

  public abstract connect(chainId?: number): Promise<ConnectResultEnum>

  public abstract disconnect(): Promise<void>

  public abstract switchNetwork(chainId?: number): Promise<void>

  public abstract setupNetwork(networkDetails: NetworkDetails): Promise<void>

  public abstract getProvider(): T

  public getChainId(): number | undefined {
    return this.chainId
  }

  public getAccount(): Address | undefined {
    return this.account
  }

  // subscribe on connector state changes
  public subscribe(listener: Listener): Destructor {
    this._listeners.push(listener)
    return () => (this._listeners = this._listeners.filter((item) => item !== listener))
  }

  // on emitEvent send all listeners current state of connector
  protected emitEvent(): void {
    const event: ConnectionInfo = {
      isConnected: this.isConnected,
      isActive: this.isActive,
      isActivating: this.isActivating,
      chainId: this.chainId,
      account: this.account,
      provider: this.getProvider(),
    }
    this._listeners.forEach(({ next }) => next && next(event))
  }

  // emit some error if needed
  protected emitError(err: unknown): void {
    this._listeners.forEach(({ error }) => error && error(err))
  }

  // completeListeners notify all listeners that connection completed and clear listeners pool
  protected completeListeners(): void {
    this._listeners.forEach(({ complete }) => complete && complete())
    // automatically clear listeners after emitting complete
    this._listeners = []
  }
}
