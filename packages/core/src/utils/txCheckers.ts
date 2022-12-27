import { MultichainTransaction, PartialMultichainTransaction, PartialTx, Transaction, Tx } from '../types'

export function isMultichainTx(tx: Tx): tx is MultichainTransaction {
  return 'origin' in tx
}

export function isPartialMultichainTx(tx: PartialTx): tx is PartialMultichainTransaction {
  return 'origin' in tx || 'destination' in tx
}

export function isTransaction(tx: Tx): tx is Transaction {
  return 'hash' in tx
}
