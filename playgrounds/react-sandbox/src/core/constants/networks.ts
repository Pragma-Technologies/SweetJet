import {
  ConnectorBaseEnum,
  EvmChainIdsEnum,
  EvmNetworkInfo,
  TvmChainIdsEnum,
  TvmNetworkInfo,
} from '@pragma-web-utils/core'
import { EvmExplorersEnum, TvmExplorersEnum } from '../enums/network/ExplorersEnum'
import { EvmNetworkKeysEnum } from '../enums/network/NetworkKeys'
import { EvmRpsUrlsEnum, TvmGrpsUrlsEnum } from '../enums/network/RpcUrlsEnum'

export const BSCMainnet: EvmNetworkInfo<'BSC_MAINNET'> = {
  networkName: 'BNB Chain',
  rpcUrl: EvmRpsUrlsEnum.BSC_MAINNET,
  chainId: EvmChainIdsEnum.BSC_MAINNET,
  symbol: 'BNB',
  explorer: EvmExplorersEnum.BSC_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.BSC_MAINNET,
}
export const BSCTestnet: EvmNetworkInfo<'BSC_TESTNET'> = {
  networkName: 'BSC Testnet',
  rpcUrl: EvmRpsUrlsEnum.BSC_TESTNET,
  chainId: EvmChainIdsEnum.BSC_TESTNET,
  symbol: 'BNB',
  explorer: EvmExplorersEnum.BSC_TESTNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.BSC_TESTNET,
}
export const PolygonMainnet: EvmNetworkInfo<'POLYGON_MAINNET'> = {
  networkName: 'Polygon',
  rpcUrl: EvmRpsUrlsEnum.POLYGON_MAINNET,
  chainId: EvmChainIdsEnum.POLYGON_MAINNET,
  symbol: 'MATIC',
  explorer: EvmExplorersEnum.POLYGON_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.POLYGON_MAINNET,
}
export const PolygonTestnet: EvmNetworkInfo<'POLYGON_TESTNET'> = {
  networkName: 'Polygon Testnet',
  rpcUrl: EvmRpsUrlsEnum.POLYGON_TESTNET,
  chainId: EvmChainIdsEnum.POLYGON_TESTNET,
  symbol: 'MATIC',
  explorer: EvmExplorersEnum.POLYGON_TESTNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.POLYGON_TESTNET,
}
export const TronMainnet: TvmNetworkInfo<'MAINNET'> = {
  networkName: 'Tron',
  grpcUrl: TvmGrpsUrlsEnum.MAINNET,
  chainId: TvmChainIdsEnum.MAINNET,
  symbol: 'TRX',
  explorer: TvmExplorersEnum.MAINNET,
  base: ConnectorBaseEnum.TVM,
}
export const TronShasta: TvmNetworkInfo<'SHASTA'> = {
  networkName: 'Shasta',
  grpcUrl: TvmGrpsUrlsEnum.SHASTA,
  chainId: TvmChainIdsEnum.SHASTA,
  symbol: 'TRX',
  explorer: TvmExplorersEnum.SHASTA,
  base: ConnectorBaseEnum.TVM,
}
export const AvalancheMainnet: EvmNetworkInfo<'AVALANCHE_MAINNET'> = {
  networkName: 'Avalanche',
  rpcUrl: EvmRpsUrlsEnum.AVALANCHE_MAINNET,
  chainId: EvmChainIdsEnum.AVALANCHE_MAINNET,
  symbol: 'AVAX',
  explorer: EvmExplorersEnum.AVALANCHE_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.AVALANCHE_MAINNET,
}
export const AvalancheTestnet: EvmNetworkInfo<'AVALANCHE_TESTNET'> = {
  networkName: 'Avalanche Testnet',
  rpcUrl: EvmRpsUrlsEnum.AVALANCHE_TESTNET,
  chainId: EvmChainIdsEnum.AVALANCHE_TESTNET,
  symbol: 'AVAX',
  explorer: EvmExplorersEnum.AVALANCHE_TESTNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.AVALANCHE_TESTNET,
}
export const AuroraMainnet: EvmNetworkInfo<'AURORA_MAINNET'> = {
  networkName: 'Aurora',
  rpcUrl: EvmRpsUrlsEnum.AURORA_MAINNET,
  chainId: EvmChainIdsEnum.AURORA_MAINNET,
  symbol: 'ETH',
  explorer: EvmExplorersEnum.AURORA_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.AURORA_MAINNET,
}
export const AuroraTestnet: EvmNetworkInfo<'AURORA_TESTNET'> = {
  networkName: 'Aurora Testnet',
  rpcUrl: EvmRpsUrlsEnum.AURORA_TESTNET,
  chainId: EvmChainIdsEnum.AURORA_TESTNET,
  symbol: 'ETH',
  explorer: EvmExplorersEnum.AURORA_TESTNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.AURORA_TESTNET,
}
export const EthereumMainnet: EvmNetworkInfo<'ETHEREUM_MAINNET'> = {
  networkName: 'Ethereum',
  rpcUrl: EvmRpsUrlsEnum.ETHEREUM_MAINNET,
  chainId: EvmChainIdsEnum.ETHEREUM_MAINNET,
  symbol: 'ETH',
  explorer: EvmExplorersEnum.ETHEREUM_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.ETHEREUM_MAINNET,
}
export const MoonbeamMainnet: EvmNetworkInfo<'MOONBEAM_MAINNET'> = {
  networkName: 'Moonbeam',
  rpcUrl: EvmRpsUrlsEnum.MOONBEAM_MAINNET,
  chainId: EvmChainIdsEnum.MOONBEAM_MAINNET,
  symbol: 'DEV',
  explorer: EvmExplorersEnum.MOONBEAM_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.MOONBEAM_MAINNET,
}
export const MoonbeamTestnet: EvmNetworkInfo<'MOONBEAM_TESTNET'> = {
  networkName: 'Moonbeam',
  rpcUrl: EvmRpsUrlsEnum.MOONBEAM_TESTNET,
  chainId: EvmChainIdsEnum.MOONBEAM_TESTNET,
  symbol: 'DEV',
  explorer: EvmExplorersEnum.MOONBEAM_TESTNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.MOONBEAM_TESTNET,
}
export const OptimismMainnet: EvmNetworkInfo<'OPTIMISM_MAINNET'> = {
  networkName: 'Optimism',
  rpcUrl: EvmRpsUrlsEnum.OPTIMISM_MAINNET,
  chainId: EvmChainIdsEnum.OPTIMISM_MAINNET,
  symbol: 'OETH',
  explorer: EvmExplorersEnum.OPTIMISM_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.OPTIMISM_MAINNET,
}
export const OptimismTestnet: EvmNetworkInfo<'OPTIMISM_TESTNET'> = {
  networkName: 'Optimism Testnet',
  rpcUrl: EvmRpsUrlsEnum.OPTIMISM_TESTNET,
  chainId: EvmChainIdsEnum.OPTIMISM_TESTNET,
  symbol: 'OETH',
  explorer: EvmExplorersEnum.OPTIMISM_TESTNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.OPTIMISM_TESTNET,
}
export const ArbitrumMainnet: EvmNetworkInfo<'ARBITRUM_MAINNET'> = {
  networkName: 'Arbitrum One',
  rpcUrl: EvmRpsUrlsEnum.ARBITRUM_MAINNET,
  chainId: EvmChainIdsEnum.ARBITRUM_MAINNET,
  symbol: 'ETH',
  explorer: EvmExplorersEnum.ARBITRUM_MAINNET,
  base: ConnectorBaseEnum.EVM,
  key: EvmNetworkKeysEnum.ARBITRUM_MAINNET,
}
