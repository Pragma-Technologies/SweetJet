import { NetworkDetails, WalletConnectConnector } from '@pragma-web-utils/connectors'
import { FC } from 'react'

export const BSC_MAINNET_RPC_URL = 'https://bsc-dataseed.binance.org/'
export const POLYGON_TESTNET_RPC_URL = 'https://matic-mumbai.chainstacklabs.com/'

const supportedNetworks: NetworkDetails[] = [
  {
    chainId: 56,
    rpc: BSC_MAINNET_RPC_URL,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    chainName: 'Smart Chain',
  },
  {
    chainId: 80001,
    rpc: POLYGON_TESTNET_RPC_URL,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    chainName: 'Smart Chain Testnet',
  },
]

const walletConnectConnector = new WalletConnectConnector(supportedNetworks, 80001, {
  chains: [80001, 56],
  projectId: '950fe091736f3a09cb331f3a0013475e',
  methods: [
    'eth_sendTransaction',
    'eth_signTransaction',
    'eth_sign',
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v4',
  ],
  events: ['chainChanged', 'accountsChanged'],
  showQrModal: true,
})

export const ConnectorsPage: FC = () => {
  return <button onClick={() => walletConnectConnector.connect(80001)}>connect</button>
}
