import { TransactionStatusEnum } from '../enums'

export const PendingStatuses = new Set([TransactionStatusEnum.UNKNOWN, TransactionStatusEnum.PENDING, undefined])
