import { ConnectionInfo, ConnectResultEnum } from '@pragma-web-utils/connectors'
import { ConnectorBaseEnum, EvmChainIdsEnum } from '@pragma-web-utils/core'
import React, { FC, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { LocalStorageKeysEnum } from '../../core/enums/LocalStorageKeysEnum'
import { ConnectorNamesEnum } from '../../core/enums/services/ConnectorNamesEnum'
import {
  ChosenConnectorService,
  ChosenConnectorsProps,
  ConnectorsSets,
} from '../../core/interfaces/ChosenNetworkService'
import { useLocalStorage } from '../../hooks/common/useLocalStorage'
import { getLocalStorageName } from '../../utils/transformLocalStorage'

const defaultConnectorSets: ConnectorsSets = {
  [ConnectorNamesEnum.META_MASK]: { name: ConnectorNamesEnum.META_MASK, connector: null },
  [ConnectorNamesEnum.TRON]: { name: ConnectorNamesEnum.TRON, connector: null },
}

const defaultConnectionState: ConnectionInfo = {
  isConnected: false,
  isActivating: false,
  isActive: false,
  provider: null,
  account: undefined,
  chainId: undefined,
}

const ChosenConnectorsContext = React.createContext<ChosenConnectorService>({
  chosenConnectorType: undefined,
  connectorSets: defaultConnectorSets,
  evmConnector: undefined,
  setConnectorType: () => undefined,
  connectionState: defaultConnectionState,
  connectorBase: ConnectorBaseEnum.EVM,
})

export const useConnectorService = (): ChosenConnectorService => useContext(ChosenConnectorsContext)

export const ChosenConnectorsProvider: FC<ChosenConnectorsProps> = ({ children, getConnectorByName }) => {
  const evmConnectorNameCacheKey = getLocalStorageName(LocalStorageKeysEnum.EVM_CONNECTOR_NAME)
  const connectorBaseCacheKey = getLocalStorageName(LocalStorageKeysEnum.CONNECTOR_BASE)
  const connectChainIdRef = useRef<EvmChainIdsEnum | undefined>(undefined)

  const [evmConnectorTypeCache, setEvmConnectorTypeCache] = useLocalStorage<ConnectorNamesEnum | undefined>(
    evmConnectorNameCacheKey,
    undefined,
  )
  const [connectorBase, setConnectorBase] = useLocalStorage<ConnectorBaseEnum>(
    connectorBaseCacheKey,
    ConnectorBaseEnum.EVM,
  )
  const [evmConnectorType, setEvmConnectorType] = useState<ConnectorNamesEnum | undefined>(evmConnectorTypeCache)

  const [connectionState, setConnectionState] = useState<ConnectionInfo>(defaultConnectionState)

  const evmConnector = useMemo(() => {
    const connector = getConnectorByName(evmConnectorType)
    return !connector ? undefined : connector
  }, [evmConnectorType])

  useEffect(
    () =>
      evmConnector?.subscribe({
        next: (state) => {
          setConnectionState(state)
        },
      }),
    [evmConnector],
  )

  // try to reconnect by selected connector base
  useEffect(() => {
    if (connectorBase === ConnectorBaseEnum.EVM && evmConnector) {
      const tryActivate = async () => {
        const result = await evmConnector?.connect(connectChainIdRef.current)
        connectChainIdRef.current = undefined
        if (!result || result === ConnectResultEnum.FAIL) {
          setEvmConnectorType(undefined)
        }
      }
      tryActivate()
    }
  }, [evmConnector, connectorBase])

  useEffect(() => setEvmConnectorTypeCache((prev) => evmConnectorType || prev), [evmConnectorType])
  const connectorSets = useMemo(
    (): ConnectorsSets => ({
      [ConnectorNamesEnum.META_MASK]: {
        name: ConnectorNamesEnum.META_MASK,
        connector: getConnectorByName(ConnectorNamesEnum.META_MASK),
      },
      [ConnectorNamesEnum.TRON]: { name: ConnectorNamesEnum.TRON, connector: null },
    }),
    [getConnectorByName],
  )

  const memoizedProvidedValue = useMemo<ChosenConnectorService>(
    () => ({
      connectorSets,
      chosenConnectorType: connectorBase === ConnectorBaseEnum.EVM ? evmConnectorType : ConnectorNamesEnum.TRON,
      evmConnector: evmConnector,
      setConnectorType: (type, chainId) => {
        switch (type) {
          case ConnectorNamesEnum.TRON:
            setConnectorBase(ConnectorBaseEnum.TVM)
            break
          case ConnectorNamesEnum.META_MASK:
            connectChainIdRef.current = chainId
            setConnectorBase(ConnectorBaseEnum.EVM)
            setConnectionState(defaultConnectionState)
            setEvmConnectorType(type)
            break
          case undefined:
            setConnectionState(defaultConnectionState)
            setEvmConnectorType(undefined)
        }
      },
      connectionState,
      connectorBase,
    }),
    [evmConnectorType, evmConnector, connectionState, connectorSets, connectorBase],
  )

  return <ChosenConnectorsContext.Provider value={memoizedProvidedValue}>{children}</ChosenConnectorsContext.Provider>
}
