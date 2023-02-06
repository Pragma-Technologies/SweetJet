import { EMPTY_ADDRESS } from '@pragma-web-utils/core'

class FakeFortmatic {
  getProvider() {
    return { request: async () => [EMPTY_ADDRESS] }
  }
}

export default FakeFortmatic
