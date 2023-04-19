import { ConnectorBaseEnum, EvmNetworkInfo, TvmNetworkInfo } from '@pragma-web-utils/core'
import React, { useContext, useMemo } from 'react'
import * as Networks from '../../core/constants/networks'
import { ChosenNetworkService } from '../../core/interfaces/ChosenNetworkService'
import { useAccount } from './AccountsService'
import { useConnectorService } from './ChosenConnectorsService'

const networkSets: {
  [ConnectorBaseEnum.EVM]: { mainnet: EvmNetworkInfo; testnet: EvmNetworkInfo }[]
  [ConnectorBaseEnum.TVM]: { mainnet: TvmNetworkInfo; testnet: TvmNetworkInfo }[]
} = {
  [ConnectorBaseEnum.EVM]: [
    { mainnet: Networks.BSCMainnet, testnet: Networks.BSCTestnet },
    { mainnet: Networks.PolygonMainnet, testnet: Networks.PolygonTestnet },
    { mainnet: Networks.AvalancheMainnet, testnet: Networks.AvalancheTestnet },
    { mainnet: Networks.AuroraMainnet, testnet: Networks.AuroraTestnet },
    { mainnet: Networks.MoonbeamMainnet, testnet: Networks.MoonbeamTestnet },
    { mainnet: Networks.OptimismMainnet, testnet: Networks.OptimismTestnet },
  ],
  [ConnectorBaseEnum.TVM]: [{ mainnet: Networks.TronMainnet, testnet: Networks.TronShasta }],
}

const ChosenNetworkContext = React.createContext<ChosenNetworkService>({
  availableNetworks: [],
  chosenNetwork: undefined,
})

export const useNetworkService = (): ChosenNetworkService => useContext(ChosenNetworkContext)

export const ChosenNetworkProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { connectorBase } = useConnectorService()
  const { chainId } = useAccount()[connectorBase]

  const memoizedProvidedValue = useMemo<ChosenNetworkService>(() => {
    const networkSet = networkSets[connectorBase]
    const testnetNetwork = networkSet.map(({ testnet }) => testnet).find((network) => network.chainId === chainId)
    const mainnetNetwork = networkSet.map(({ mainnet }) => mainnet).find((network) => network.chainId === chainId)
    const setType = !!testnetNetwork ? 'testnet' : 'mainnet'
    const network = !!testnetNetwork ? testnetNetwork : mainnetNetwork

    return {
      availableNetworks: networkSets[connectorBase].map((item) => item[setType]),
      chosenNetwork: network,
    }
  }, [chainId])

  return <ChosenNetworkContext.Provider value={memoizedProvidedValue}>{children}</ChosenNetworkContext.Provider>
}
