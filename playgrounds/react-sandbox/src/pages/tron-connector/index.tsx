import { ConnectionInfo, TronConnector } from '@pragma-web-utils/connectors'
import { TvmChainIdsEnum } from '@pragma-web-utils/core'
import { FC, useCallback, useEffect, useState } from 'react'

const tronConnector = new TronConnector(TvmChainIdsEnum.SHASTA)

export const TronConnectorsPage: FC = () => {
  const [state1, setState1] = useState<ConnectionInfo | null>(null)
  const [stateErr, setStateErr] = useState<unknown>(null)
  useEffect(() => {
    tronConnector.subscribe({
      next: (data) => {
        console.log(data)
        setState1(data)
        setStateErr(null)
      },
      error: (error) => {
        console.error(error)
        setState1(null)
        setStateErr(stateErr)
      },
      complete: () => {
        console.log('complete')
      },
    })
  }, [])

  const connect = useCallback(async () => {
    await tronConnector.connect(TvmChainIdsEnum.SHASTA)
  }, [])
  return (
    <>
      <div>tron: {(!!(global as { tron?: unknown })?.tron).toString()}</div>
      <div>account: {state1?.account?.toBase58()}</div>
      <div>chain: {state1?.chainId}</div>
      <div>isConnected: {`${state1?.isConnected}`}</div>
      <div>stateErr: {stateErr}</div>
      <button onClick={connect}>connect</button>
    </>
  )
}
