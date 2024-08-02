import { TransactionStatusEnum } from '@pragma-web-utils/core'
import { getTxStatus } from './getTxStatus'

const grpc = 'https://api.shasta.trongrid.io/'

describe('getTxStatus', () => {
  it('success', async () => {
    const status = await getTxStatus(grpc, 'f50a9feb2eb7eb82227c9ed186f9076e2ba53e6ed76dc975db9c280fcc68ba46')
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
  })
  it('error', async () => {
    const status = await getTxStatus(grpc, '77952d954959810598f3e04c77a99aa7071f320b18cf0eab2bc7e6599cda38ed')
    expect(status).toBe(TransactionStatusEnum.FAILED)
  })
  it('unknown', async () => {
    const status = await getTxStatus(grpc, 'wrongHash')
    expect(status).toBe(undefined)
  })
})
