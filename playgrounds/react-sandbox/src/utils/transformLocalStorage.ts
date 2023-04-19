import { LOCAL_STORAGE_VERSION } from '../core/constants/common'
import { LocalStorageKeysEnum } from '../core/enums/LocalStorageKeysEnum'

export const getLocalStorageName = (name: LocalStorageKeysEnum): string => {
  return `v${LOCAL_STORAGE_VERSION}_${name}`
}
