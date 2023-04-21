import { ExternalProvider } from '@ethersproject/providers'
import { ConnectorBaseEnum, EMPTY_ADDRESS, EvmChainIdsEnum, TRON_EMPTY_ADDRESS } from '@pragma-web-utils/core'
import React, { FC, useContext, useMemo } from 'react'
import {
  AccountContext,
  AccountsContext,
  ChosenConnectorsProps,
  TransactionApp,
  TronAccountContext,
  Web3AccountContext,
} from '../../core/interfaces/ChosenNetworkService'
import { ChosenConnectorsProvider, useConnectorService } from './ChosenConnectorsService'
import { ChosenNetworkProvider } from './ChosenNetworkService'
import { TronAccountContextProvider, useTronWeb } from './TronAccountService'

const defaultAccountContext: AccountContext<null, number, TransactionApp> = {
  connected: false,
  active: false,
  isActivating: false,
  activate: async () => undefined,
  deactivate: () => undefined,
  switchNetwork: () => undefined,
  account: EMPTY_ADDRESS,
  app: 'Web3',
  hasAppExtension: false,
}

const AccountsInfoContext = React.createContext<AccountsContext>({
  [ConnectorBaseEnum.TVM]: { ...defaultAccountContext } as TronAccountContext,
  [ConnectorBaseEnum.EVM]: { ...defaultAccountContext } as Web3AccountContext,
})
const hasEthereumExtension = !!(window as { ethereum?: unknown }).ethereum
export const useAccount = (): AccountsContext => useContext(AccountsInfoContext)

const InnerAccountContextProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { tronWeb, account: tronAccount, ...tronContext } = useTronWeb()
  const { evmConnector, connectionState } = useConnectorService()

  const providedValue = useMemo((): AccountsContext => {
    const activate = async () => {
      void (await evmConnector?.connect())
    }
    const deactivate = () => evmConnector?.disconnect()
    const switchNetwork = (chainId?: EvmChainIdsEnum) => {
      evmConnector?.switchNetwork(chainId)
    }
    const provider = evmConnector?.getProvider() as ExternalProvider

    return {
      [ConnectorBaseEnum.EVM]: {
        library: !!provider ? { provider } : null,
        account: connectionState.account ?? EMPTY_ADDRESS,
        chainId: connectionState.chainId,
        connected: connectionState.isConnected,
        active: connectionState.isActive,
        isActivating: connectionState.isActivating,
        activate,
        deactivate,
        switchNetwork,
        app: 'Web3',
        hasAppExtension: hasEthereumExtension,
      },
      [ConnectorBaseEnum.TVM]: {
        ...tronContext,
        account: tronAccount || TRON_EMPTY_ADDRESS,
        deactivate: () => undefined, // TODO: investigate this option implementation
        switchNetwork: () => undefined, // TODO: investigate this option implementation
        connected: !!tronAccount,
        active: !!tronAccount,
        isActivating: false,
        library: tronWeb,
        app: 'Tron',
        hasAppExtension: !!tronWeb,
      },
    }
  }, [tronContext, evmConnector, connectionState])

  return (
    <AccountsInfoContext.Provider value={providedValue}>
      <UseProvidedUserAddressForAccountInfo>{children}</UseProvidedUserAddressForAccountInfo>
    </AccountsInfoContext.Provider>
  )
}

export const AccountContextProvider: FC<ChosenConnectorsProps> = ({ children, getConnectorByName }) => {
  return (
    <ChosenConnectorsProvider getConnectorByName={getConnectorByName}>
      <TronAccountContextProvider>
        <InnerAccountContextProvider>
          <ChosenNetworkProvider>{children}</ChosenNetworkProvider>
        </InnerAccountContextProvider>
      </TronAccountContextProvider>
    </ChosenConnectorsProvider>
  )
}

const UseProvidedUserAddressForAccountInfo: React.FC = ({ children }) => {
  const { [ConnectorBaseEnum.EVM]: Web3, [ConnectorBaseEnum.TVM]: TRON } = useAccount()
  const providedTronAccount = process.env.REACT_APP_ACCOUNT_TRON
  const providedWeb3Account = process.env.REACT_APP_ACCOUNT_WEB3

  const providedValue = {
    [ConnectorBaseEnum.EVM]: {
      ...Web3,
      account: providedWeb3Account ? providedWeb3Account : Web3.account,
    },
    [ConnectorBaseEnum.TVM]: {
      ...TRON,
      account: providedTronAccount ? providedTronAccount : TRON.account,
    },
  }

  if (providedTronAccount || providedWeb3Account) {
    return <AccountsInfoContext.Provider value={providedValue}>{children}</AccountsInfoContext.Provider>
  }

  return <>{children}</>
}
