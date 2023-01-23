import { TransactionStatusEnum } from '../enums'

export const pendingStatuses = new Set([TransactionStatusEnum.UNKNOWN, TransactionStatusEnum.PENDING, undefined])
