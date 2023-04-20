import { render } from '@testing-library/react'
import React from 'react'
import { HookCommonState } from '../types'
import { createStateContextEnvironment } from './createStateContextEnvironment'

const Skeleton = () => <></>
const Error = () => <></>

const emptyState: HookCommonState<string | undefined> = {
  value: undefined,
  error: undefined,
  isActual: true,
  isLoading: false,
  cached: undefined,
  softRefresh: () => undefined,
  hardRefresh: () => undefined,
}

describe('createStrictConstantEnvironment', () => {
  const contextName = 'testContext'
  const mockContext = React.createContext<unknown>(undefined)
  const { strictValueHook, wrapper: Wrapper } = createStateContextEnvironment<string>(contextName, mockContext)
  const { strictValueHook: hookWithoutCustomContext, wrapper: WrapperWithoutCustomContext } =
    createStateContextEnvironment<string>(contextName)

  const ChildComponent = () => {
    return <div>Child component</div>
  }

  it('should return an object with a hook and a wrapper', () => {
    const withCustomContext = createStateContextEnvironment(contextName, mockContext)

    expect(withCustomContext).toHaveProperty('strictValueHook')
    expect(withCustomContext).toHaveProperty('wrapper')

    const withoutUserContext = createStateContextEnvironment(contextName)
    expect(withoutUserContext).toHaveProperty('strictValueHook')
    expect(withoutUserContext).toHaveProperty('wrapper')
  })

  it('should render children component', () => {
    const value = 'test'

    let state

    const Component = () => {
      state = strictValueHook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper stateValue={{ ...emptyState, value }} Skeleton={Skeleton} ErrorState={Error}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Child component')
    expect(state).toStrictEqual(value)
  })

  it('should render children component without user custom context', () => {
    const value = 'test'

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext stateValue={{ ...emptyState, value }} Skeleton={Skeleton} ErrorState={Error}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent?.trim()).toBe('Child component')
    expect(state).toStrictEqual(value)
  })
})
