import { ExternalProvider } from '@ethersproject/providers'
import { BaseConnector, ConnectionInfo } from '@pragma-web-utils/connectors'
import {
  ConnectorBaseEnum,
  EvmChainIdsEnum,
  EvmNetworkInfo,
  TvmChainIdsEnum,
  TvmNetworkInfo,
} from '@pragma-web-utils/core'
import { TronWeb } from 'tronweb-typings'
import { ConnectorNamesEnum } from '../enums/services/ConnectorNamesEnum'

export type TransactionApp = 'Tron' | 'Web3'

export interface ChosenNetworkService {
  availableNetworks: (EvmNetworkInfo | TvmNetworkInfo)[]
  chosenNetwork: EvmNetworkInfo | TvmNetworkInfo | undefined
}

export type ConnectorsInfo = {
  name: ConnectorNamesEnum
  connector: BaseConnector | null
}

export type ConnectorsSets = Record<ConnectorNamesEnum, ConnectorsInfo>

export interface ChosenConnectorService {
  connectorBase: ConnectorBaseEnum
  chosenConnectorType: ConnectorNamesEnum | undefined
  connectorSets: ConnectorsSets
  evmConnector: BaseConnector | undefined
  setConnectorType: (type?: ConnectorNamesEnum, chainId?: EvmChainIdsEnum) => void
  connectionState: ConnectionInfo
}

export type ChosenConnectorsProps = {
  getConnectorByName: (connectorType: ConnectorNamesEnum | undefined) => BaseConnector | null
}

export type Web3Library = { provider: ExternalProvider }

export type Web3AccountContext = AccountContext<Web3Library | null, EvmChainIdsEnum, 'Web3'>
export type TronAccountContext = AccountContext<TronWeb, TvmChainIdsEnum, 'Tron'>

export interface AccountsContext {
  [ConnectorBaseEnum.EVM]: Web3AccountContext
  [ConnectorBaseEnum.TVM]: TronAccountContext
}

export interface AccountContext<L, C extends string | number, A extends TransactionApp> {
  activate: () => Promise<void>
  library?: L
  chainId?: C
  account: string
  connected: boolean
  active: boolean
  isActivating: boolean
  app: A
  hasAppExtension: boolean

  deactivate(): void

  switchNetwork(chainId?: C): void
}
