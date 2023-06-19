import { BaseConnector, MetamaskConnector, NetworkDetails } from '@pragma-web-utils/connectors'
import { EvmChainIdsEnum, EvmNetworkInfo } from '@pragma-web-utils/core'
import * as Networks from '../../core/constants/networks'
import { ConnectorNamesEnum } from '../../core/enums/services/ConnectorNamesEnum'

const _supportedNetworks: EvmNetworkInfo[] = [
  Networks.BSCMainnet,
  Networks.BSCTestnet,
  Networks.PolygonMainnet,
  Networks.PolygonTestnet,
  Networks.AuroraMainnet,
  Networks.AuroraTestnet,
  Networks.MoonbeamMainnet,
  Networks.MoonbeamTestnet,
  Networks.AvalancheMainnet,
  Networks.AvalancheTestnet,
  Networks.ArbitrumMainnet,
  Networks.EthereumMainnet,
  Networks.OptimismMainnet,
  Networks.OptimismTestnet,
]
const supportedNetworks = _supportedNetworks.map((item) => ({
  chainId: item.chainId,
  rpc: item.rpcUrl,
  nativeCurrency: {
    name: item.symbol, // TODO: add name to network info
    symbol: item.symbol,
    decimals: 18, // TODO: add decimals to network info
  },
  chainName: item.networkName,
})) as NetworkDetails[]

const defaultChainId = EvmChainIdsEnum.BSC_MAINNET
const defaultActiveChainIds = [
  EvmChainIdsEnum.POLYGON_MAINNET,
  EvmChainIdsEnum.BSC_MAINNET,
  EvmChainIdsEnum.BSC_TESTNET,
  EvmChainIdsEnum.POLYGON_TESTNET,
  EvmChainIdsEnum.AURORA_MAINNET,
  EvmChainIdsEnum.AURORA_TESTNET,
  EvmChainIdsEnum.POLYGON_MAINNET,
  EvmChainIdsEnum.AVALANCHE_TESTNET,
  EvmChainIdsEnum.AVALANCHE_MAINNET,
  EvmChainIdsEnum.ETHEREUM_MAINNET,
  EvmChainIdsEnum.ETHEREUM_RINKEBY_TESTNET,
]

const metamaskConnector = new MetamaskConnector(supportedNetworks, defaultChainId, defaultActiveChainIds)

export function getConnectorByName(connectorType: ConnectorNamesEnum | undefined): BaseConnector | null {
  switch (connectorType) {
    case ConnectorNamesEnum.META_MASK:
      return metamaskConnector
    default:
      return null
  }
}
