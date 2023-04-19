import { ConnectorBaseEnum } from '@pragma-web-utils/core'
import { FC, useCallback } from 'react'
import { ConnectorNamesEnum } from '../../core/enums/services/ConnectorNamesEnum'
import { ConnectorsInfo } from '../../core/interfaces/ChosenNetworkService'
import { useAccount } from '../../services/accountService/AccountsService'
import { useConnectorService } from '../../services/accountService/ChosenConnectorsService'
import { TabsContainer, WalletTab } from './style'

const connectorsOrder: ConnectorNamesEnum[] = [ConnectorNamesEnum.META_MASK, ConnectorNamesEnum.TRON]

export const WalletsConnect: React.FC = () => {
  const { connectorSets, chosenConnectorType, connectorBase } = useConnectorService()
  const accountInfo = useAccount()

  const currentAccountInfo = accountInfo[connectorBase]
  return !!chosenConnectorType && !currentAccountInfo.active && currentAccountInfo.connected ? (
    <div>Not support</div>
  ) : (
    <>
      <TabsContainer>
        {connectorsOrder.map((name) => (
          <ConnectorItem key={name} connectorInfo={connectorSets[name]} />
        ))}
      </TabsContainer>
    </>
  )
}

export const DefaultWalletsConnectContainer: React.FC = () => {
  return <WalletsConnect />
}

const ConnectorItem: FC<{ connectorInfo: ConnectorsInfo }> = ({ connectorInfo }) => {
  const { setConnectorType, chosenConnectorType } = useConnectorService()
  const { active, activate } = useAccount()[ConnectorBaseEnum.EVM]

  const onClick = useCallback(() => {
    if (chosenConnectorType === connectorInfo.name) {
      !active ? activate() : undefined
    } else {
      setConnectorType(connectorInfo.name)
    }
  }, [connectorInfo, setConnectorType])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as { ethereum: any }).ethereum

  if (connectorInfo.name === ConnectorNamesEnum.META_MASK && !ethereum?.isMetaMask) {
    return <WalletTab onClick={onClick}>Injected connector</WalletTab>
  }

  return <WalletTab onClick={onClick}>{connectorInfo.name}</WalletTab>
}
