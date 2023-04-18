/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestDelayUtils, TvmChainIdsEnum } from '@pragma-web-utils/core'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { TronWeb } from 'tronweb-typings'
import { RequestAccounts, TronWebDetails, TronWebNode } from '../../core/interfaces/Tron'

async function getRequestAccounts(tronWeb: any): Promise<RequestAccounts> {
  await RequestDelayUtils.addDelay()
  return await tronWeb.request({ method: 'tron_requestAccounts' })
}

function getChain(host?: string): TvmChainIdsEnum | undefined {
  switch (host) {
    case 'https://api.trongrid.io':
    case 'https://api.tronstack.io':
      return TvmChainIdsEnum.MAINNET
    case 'https://api.shasta.trongrid.io':
      return TvmChainIdsEnum.SHASTA
    default:
      return undefined
  }
}

const handleActivateError = (error: Error, throwErrors: boolean, onError?: (error: Error) => void): void => {
  if (!!onError) {
    onError(error as Error)
  }

  console.error('AccountService(activate):', error)

  if (throwErrors) {
    throw error
  }
}

let { tronWeb } = window as { tronWeb: TronWeb | undefined }

const AccountContext = React.createContext<TronWebDetails>({
  account: undefined,
  chainId: undefined,
  tronWeb,
  activate: async () => undefined,
})

export const useTronWeb = (): TronWebDetails => ({ ...useContext(AccountContext) })

export const TronAccountContextProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const initialSolidityNode = (tronWeb as TronWebNode)?.solidityNode?.host
  const [chain, setChain] = useState<TvmChainIdsEnum | undefined>(getChain(initialSolidityNode))

  const initialAddress = (tronWeb as TronWebNode)?.defaultAddress?.base58 || undefined
  const [account, setAccount] = useState<string | undefined>(initialAddress)

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true)

  const activate = useCallback(
    async (onError?: (error: Error) => void, throwErrors = false): Promise<void> => {
      if ((!isLoggedIn && !account) || !tronWeb) {
        return handleActivateError(new Error(!tronWeb ? 'Missed TronWeb' : 'Logged out user'), throwErrors, onError)
      }

      try {
        await getRequestAccounts(tronWeb)
      } catch (error) {
        handleActivateError(error as Error, throwErrors, onError)
      }
    },
    [isLoggedIn, account, tronWeb],
  )

  function updateNode(solidityNode?: string): void {
    setChain(getChain(solidityNode))
  }

  function onPossibleChanges(): void {
    tronWeb = window.tronWeb as TronWeb | undefined
    const newAddress = tronWeb?.defaultAddress?.base58 || undefined
    const newSolidityNode = (tronWeb as TronWebNode)?.solidityNode?.host

    updateNode(newSolidityNode)
    setAccount(newAddress)
  }

  function onNewConnection(payload?: { address?: string; isAuth?: boolean; node?: { solidityNode?: string } }): void {
    tronWeb = window.tronWeb as TronWeb | undefined
    const newAddress = payload?.address || tronWeb?.defaultAddress?.base58 || undefined
    const newSolidityNode = payload?.node?.solidityNode || (tronWeb as TronWebNode)?.solidityNode?.host

    updateNode(newSolidityNode)
    setAccount(newAddress)
  }

  function onDisconnect(): void {
    updateNode(undefined)
    setAccount(undefined)
  }

  function onMessage(e: MessageEvent): void {
    const isValidTronWebEvent = !!e?.data?.isTronLink && !!e?.data?.message?.action
    if (!isValidTronWebEvent) {
      return
    }

    // TODO: add event action enum and interfaces for possible event payload
    switch (e.data.message.action) {
      case 'acceptWeb':
      case 'connectWeb':
      case 'tabReply': // init tronWeb
        onNewConnection(e.data.message.data?.data)
        break
      case 'setNode': // node changed
        updateNode(e.data.message.data?.node?.solidityNode)
        break
      case 'accountsChanged': // account switched
        setIsLoggedIn(!!e.data.message.data?.address)
        setAccount(e.data.message.data?.address || undefined)
        break
      case 'setAccount': // check auth status
        setIsLoggedIn(!!e.data.message.data?.address)
        break
      case 'connect': // on connect
        onPossibleChanges()
        break
      case 'disconnect':
      case 'disconnectWeb': // on disconnect
        setAccount(undefined)
        break
    }
  }

  useEffect(() => {
    // TronLink DApp workaround
    setTimeout(onPossibleChanges, 500)
    setIsLoggedIn(!!tronWeb?.defaultAddress?.base58)

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    window.addEventListener('offline', onDisconnect)
    return () => window.removeEventListener('offline', onDisconnect)
  }, [])

  useEffect(() => {
    window.addEventListener('online', onPossibleChanges)
    return () => window.removeEventListener('online', onPossibleChanges)
  }, [])

  // show tron auth window on page load if user is not authenticated
  let hasAttemptOfAuthentication = false
  const openConnectWalletWindowOnInit = useCallback(async (isLoggedIn: boolean) => {
    if (!isLoggedIn && !hasAttemptOfAuthentication) {
      await activate()
    }
    hasAttemptOfAuthentication = true
  }, [])
  useEffect(() => void (!!tronWeb && openConnectWalletWindowOnInit(!!account)), [tronWeb, account])

  const providedValue: TronWebDetails = { account, chainId: chain, tronWeb, activate }
  return <AccountContext.Provider value={providedValue}>{children}</AccountContext.Provider>
}
