import { render } from '@testing-library/react'
import React from 'react'

import { State } from '@pragma-web-utils/common-state'
import { createStrictEnvironment } from './createStrictEnvironment'

describe('createStrictEnvironment', () => {
  const contextName = 'testContext'
  const mockContext = React.createContext<unknown>(undefined)
  const { hook, wrapper: Wrapper } = createStrictEnvironment<string>(contextName, mockContext)
  const { hook: hookWithoutCustomContext, wrapper: WrapperWithoutCustomContext } =
    createStrictEnvironment<string>(contextName)

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
    const withCustomContext = createStrictEnvironment(contextName, mockContext)

    expect(withCustomContext).toHaveProperty('hook')
    expect(withCustomContext).toHaveProperty('wrapper')

    const withoutUserContext = createStrictEnvironment(contextName)
    expect(withoutUserContext).toHaveProperty('hook')
    expect(withoutUserContext).toHaveProperty('wrapper')
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

  it('should render children component without user custom context', () => {
    const valueState: State<string | undefined> = { value: 'test', error: undefined, isLoading: false, isActual: true }

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent).toBe('Child component')
    expect(state).toStrictEqual('test')
  })

  it('should render the Skeleton component when isActual is false without user custom context', () => {
    const valueState: State<string | undefined> = { value: 'test', error: undefined, isLoading: false, isActual: false }

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent).toBe('Skeleton')
    expect(state).toStrictEqual(undefined)
  })

  it('should render the Skeleton component when isLoading is true and isActual is false without user custom context', () => {
    const valueState: State<string | undefined> = { value: 'test', error: undefined, isLoading: true, isActual: false }

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent).toBe('Skeleton')
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when there is an error without user custom context', () => {
    const valueState: State<string | undefined> = {
      value: 'test',
      error: new Error(),
      isLoading: false,
      isActual: true,
    }

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent).toBe('Error')
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when value is undefined without user custom context', () => {
    const valueState: State<string | undefined> = {
      value: undefined,
      error: undefined,
      isLoading: false,
      isActual: true,
    }

    let state

    const Component = () => {
      state = hookWithoutCustomContext()
      return <ChildComponent />
    }

    const { container } = render(
      <WrapperWithoutCustomContext Skeleton={Skeleton} ErrorState={ErrorState} valueState={valueState}>
        <Component />
      </WrapperWithoutCustomContext>,
    )

    expect(container.textContent).toBe('Error')
    expect(state).toStrictEqual(undefined)
  })
})
