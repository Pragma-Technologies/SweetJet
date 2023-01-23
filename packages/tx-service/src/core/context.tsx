import { IStorable } from '@pragma-web-utils/core'
import React, { FC, useContext } from 'react'
import { TxService } from '../classes'
import { TransactionLike } from '../types'

export const TxServiceContext = React.createContext<unknown>(undefined)

export function useTxService<T extends IStorable<TransactionLike>>(): TxService<T> {
  const contextValue = useContext(TxServiceContext) as TxService<T>
  if (contextValue === undefined || contextValue === null) {
    throw 'Not provided transaction service context'
  }
  return contextValue as TxService<T>
}

const TxServiceProvider: FC<{ txService: TxService }> = ({ children, txService }) => {
  return <TxServiceContext.Provider value={txService}>{children}</TxServiceContext.Provider>
}
