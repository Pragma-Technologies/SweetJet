import { SessionTypes } from '@walletconnect/types/dist/types/sign-client/session'
import { TestEthereumProvider } from './testEthereumConnector'

export class TestWalletConnectProvider extends TestEthereumProvider {
  _session?: {}

  get session() {
    return this._session as SessionTypes.Struct
  }

  async connect(): Promise<void> {
    this._session = {}
  }

  async disconnect(): Promise<void> {
    this._session = undefined
  }
}
