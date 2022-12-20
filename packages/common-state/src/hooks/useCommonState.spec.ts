import { act, renderHook } from '@testing-library/react-hooks'
import { useCommonState } from './useCommonState'

/**
 * @jest-environment ../../../../react-jest.config
 */
describe('useCommonState hook', () => {
  it('check setRefresh', async () => {
    const data = renderHook(() => useCommonState('initial'))

    act(() => {
      data.result.current.setRefresh({ refreshFn: async () => 'success', requestKey: 'test' })
      data.result.current.state.softRefresh()
    })

    await data.waitForNextUpdate()

    expect(data.result.current.state.value).toBe('success')

    act(() => {
      data.result.current.setRefresh({ refreshFn: async () => 'success2', requestKey: 'test2' })
      data.result.current.state.softRefresh()
    })

    await data.waitForNextUpdate()

    expect(data.result.current.state.value).toBe('success2')
  })
})
