import { render } from '@testing-library/react'
import React from 'react'
import { createStrictConstantEnvironment } from './createStrictConstantEnvironment'

describe('createStrictConstantEnvironment', () => {
  const contextName = 'testContext'
  const mockContext = React.createContext<unknown>(undefined)
  const { hook, wrapper: Wrapper } = createStrictConstantEnvironment<string>(contextName, mockContext)
  const { hook: hookWithoutCustomContext, wrapper: WrapperWithoutCustomContext } =
    createStrictConstantEnvironment<string>(contextName)

  const ChildComponent = () => {
    return <div>Child component</div>
  }

  it('should return an object with a hook and a wrapper', () => {
    const withCustomContext = createStrictConstantEnvironment(contextName, mockContext)

    expect(withCustomContext).toHaveProperty('hook')
    expect(withCustomContext).toHaveProperty('wrapper')

    const withoutUserContext = createStrictConstantEnvironment(contextName)
    expect(withoutUserContext).toHaveProperty('hook')
    expect(withoutUserContext).toHaveProperty('wrapper')
  })

  it('should render children component', () => {
    const valueState = 'test'

    let state

    const Component = () => {
      state = hook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper valueState={valueState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent).toBe('Child component')
    expect(state).toStrictEqual('test')
  })

  it('should render children component without user custom context', () => {
    const valueState = 'test'

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext valueState={valueState}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent).toBe('Child component')
    expect(state).toStrictEqual('test')
  })
})
