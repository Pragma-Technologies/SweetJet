export class SignatureError extends Error {
  protected _dto: Record<string, string>

  constructor(
    public signedMessage: string,
    public account: string,
    public signature: string,
    public method: string,
    public version: string,
  ) {
    super()
    this.message = `Wrong signature:
      method - ${method},
      message - ${signedMessage},
      signature - ${signature},
      account - ${account},
      version - ${version},
    `
    this._dto = { signedMessage, account, signature, method, version }
  }

  getDto(): Record<string, unknown> {
    return { ...this._dto }
  }
}

export const networkErrorMessages = new Set(['Failed to fetch', 'Load failed'])
export const knownErrorMessages = ['window.iTron.signMessageV2 is not a function']
export const cancelMessages = new Set([
  // user cancel action in TronLink or other extension
  'Confirmation declined by user',
  'cancel',
  'cancle',
  'Cancelled',
  'user cancel',
  'The user aborted a request.',
  'The user rejected the request.',
  'AbortError: The user aborted a request.',
  'User has not unlocked wallet',
  // action confirmation time expired
  'timeout of 30000ms exceeded',
  // legacy revert
  "TypeError: Cannot read properties of null (reading 'replace')",
])
type CodeError = Error & { code: string | number }
type CodeError2 = Error & { error: string }
const sigError = {
  code: 'SIGERROR',
  message: 'Validate signature error: sig error',
}
const timeoutError = {
  code: 'TRANSACTION_EXPIRATION_ERROR',
  message: 'Transaction expired',
}
const signatureError = {
  code: 'INVALID_ARGUMENT',
  startsWith: 'non-canonical s (argument="signature", value="',
}
const userRejectError = {
  code: 4001,
  message: 'User rejected the request.',
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && networkErrorMessages.has(error.message)
}
export function isUnknownError(error: unknown): boolean {
  // SignatureError is always known error
  if (error instanceof SignatureError) {
    return false
  }
  if (typeof error === 'string') {
    return knownErrorMessages.every((message) => !error.startsWith(message))
  }
  if (error instanceof Error) {
    return knownErrorMessages.every((message) => !error.message.startsWith(message))
  }
  return true
}

export function isCancelError(error: unknown): boolean {
  if (typeof error === 'string') {
    return cancelMessages.has(error)
  }
  if (typeof error === 'object' && error && 'message' in error) {
    return (
      error instanceof CancelError ||
      cancelMessages.has((error as Error).message) ||
      ((error as CodeError).code === userRejectError.code && (error as Error).message === userRejectError.message) ||
      ((error as CodeError2).error === sigError.code && (error as Error).message === sigError.message) ||
      ((error as CodeError2).error === timeoutError.code && (error as Error).message === timeoutError.message) ||
      ((error as CodeError).code === signatureError.code &&
        (error as Error).message.startsWith(signatureError.startsWith))
    )
  }
  return false
}

export class CancelError extends Error {
  constructor(action = 'action') {
    super()
    this.message = `Signature canceled: (${action})`
  }
}
