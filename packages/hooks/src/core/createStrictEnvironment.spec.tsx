import { render } from '@testing-library/react'
import React from 'react'

import { State } from '@pragma-web-utils/common-state'
import { createStrictEnvironment } from './createStrictEnvironment'

describe('createStrictEnvironment', () => {
  const contextName = 'testContext'
  const mockContext = React.createContext<unknown>(undefined)
  const { hook, wrapper: Wrapper } = createStrictEnvironment<string>(mockContext, contextName)

  const Skeleton = () => {
    return <div>Skeleton</div>
  }
  const ErrorState = () => {
    return <div>Error</div>
  }

  const ChildComponent = () => {
    return <div>Child component</div>
  }

  it('should return an object with a hook and a wrapper', () => {
    const mockContext = React.createContext<unknown>(undefined)
    const result = createStrictEnvironment(mockContext, contextName)

    expect(result).toHaveProperty('hook')
    expect(result).toHaveProperty('wrapper')
  })

  it('should render children component', () => {
    const valueState: State<string | undefined> = { value: 'test', error: undefined, isLoading: false, isActual: true }

    let state

    const Component = () => {
      state = hook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent).toBe('Child component')
    expect(state).toStrictEqual('test')
  })

  it('should render the Skeleton component when isActual is false', () => {
    const valueState: State<string | undefined> = { value: 'test', error: undefined, isLoading: false, isActual: false }

    let state

    const Component = () => {
      state = hook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent).toBe('Skeleton')
    expect(state).toStrictEqual(undefined)
  })

  it('should render the Skeleton component when isLoading is true and isActual is false', () => {
    const valueState: State<string | undefined> = { value: 'test', error: undefined, isLoading: true, isActual: false }

    let state

    const Component = () => {
      state = hook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent).toBe('Skeleton')
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when there is an error', () => {
    const valueState: State<string | undefined> = {
      value: 'test',
      error: new Error(),
      isLoading: false,
      isActual: true,
    }

    let state

    const Component = () => {
      state = hook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent).toBe('Error')
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when value is undefined', () => {
    const valueState: State<string | undefined> = {
      value: undefined,
      error: undefined,
      isLoading: false,
      isActual: true,
    }

    let state

    const Component = () => {
      state = hook()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent).toBe('Error')
    expect(state).toStrictEqual(undefined)
  })
})
