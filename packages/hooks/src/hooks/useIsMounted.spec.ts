import { renderHook } from '@testing-library/react-hooks'
import { useIsMounted } from './useIsMounted'

describe('useIsMounted hook', () => {
  it('check rerender and unmount', async () => {
    const { result, unmount, rerender } = renderHook(() => useIsMounted())

    expect(result.current()).toBe(true)

    rerender()

    expect(result.current()).toBe(true)

    unmount()

    expect(result.current()).toBe(false)

    rerender()

    expect(result.current()).toBe(true)
  })
})
