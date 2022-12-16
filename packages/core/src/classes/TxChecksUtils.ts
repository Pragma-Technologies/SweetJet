import { PartialTx, Transaction, Tx } from '@pragma-web-utils/types/src/interfaces/Transaction'
import {
  MultichainTransaction,
  PartialMultichainTransaction,
} from '@pragma-web-utils/types/src/interfaces/TransactionMultichain'

export function isMultichainTx(tx: Tx): tx is MultichainTransaction {
  return 'origin' in tx
}

export function isPartialMultichainTx(tx: PartialTx): tx is PartialMultichainTransaction {
  return 'origin' in tx || 'destination' in tx
}

export function isTransaction(tx: Tx): tx is Transaction {
  return 'hash' in tx
}
