import { render } from '@testing-library/react'
import React from 'react'
import { HookCommonState } from '../types'
import { createStateContextEnvironment } from './createStateContextEnvironment'

const Skeleton = () => <>Skeleton</>
const ErrorState = () => <>Error</>
const ChildComponent = () => <div>Child component</div>

const emptyState: HookCommonState<string | undefined> = {
  value: undefined,
  error: undefined,
  isActual: true,
  isLoading: false,
  cached: undefined,
  softRefresh: () => undefined,
  hardRefresh: () => undefined,
}

const contextName = 'testContext'
const mockContext = React.createContext<unknown>(undefined)
const {
  strictValueHook: useStrictContextValue,
  stateHook: useContextState,
  wrapper: ContextWrapper,
} = createStateContextEnvironment<string | undefined>(contextName, { userContext: mockContext })
const {
  strictValueHook: useStrictValue,
  stateHook: useUncontestedState,
  wrapper: Wrapper,
} = createStateContextEnvironment<string>(contextName)

describe('createStateContextEnvironment', () => {
  it('should return an object with a hook and a wrapper', () => {
    const withCustomContext = createStateContextEnvironment(contextName, { userContext: mockContext })

    expect(withCustomContext).toHaveProperty('strictValueHook')
    expect(withCustomContext).toHaveProperty('stateHook')
    expect(withCustomContext).toHaveProperty('wrapper')

    const withoutUserContext = createStateContextEnvironment(contextName)
    expect(withoutUserContext).toHaveProperty('strictValueHook')
    expect(withoutUserContext).toHaveProperty('stateHook')
    expect(withoutUserContext).toHaveProperty('wrapper')
  })

  it('should render children component', () => {
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }

    let value
    let state

    const Component = () => {
      value = useStrictContextValue()
      state = useContextState()
      return <ChildComponent />
    }

    const { container } = render(
      <ContextWrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </ContextWrapper>,
    )

    expect(container.textContent?.trim()).toBe('Child component')
    expect(value).toStrictEqual(stateValue.value)
    expect(state).toEqual(stateValue)
  })

  it('should render the Skeleton component when isActual is false', () => {
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', isActual: false }

    let value
    let state

    const Component = () => {
      value = useStrictContextValue()
      state = useContextState()
      return <ChildComponent />
    }

    const { container } = render(
      <ContextWrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </ContextWrapper>,
    )

    expect(container.textContent?.trim()).toBe('Skeleton')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render the Skeleton component when isLoading is true and isActual is false', () => {
    const stateValue: HookCommonState<string | undefined> = {
      ...emptyState,
      value: 'test',
      isActual: false,
      isLoading: true,
    }

    let value
    let state

    const Component = () => {
      value = useStrictContextValue()
      state = useContextState()
      return <ChildComponent />
    }

    const { container } = render(
      <ContextWrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </ContextWrapper>,
    )

    expect(container.textContent?.trim()).toBe('Skeleton')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when there is an error', () => {
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', error: 'error' }

    let value
    let state

    const Component = () => {
      value = useStrictContextValue()
      state = useContextState()
      return <ChildComponent />
    }

    const { container } = render(
      <ContextWrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </ContextWrapper>,
    )

    expect(container.textContent?.trim()).toBe('Error')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when value is undefined', () => {
    let value
    let state

    const Component = () => {
      value = useStrictContextValue()
      state = useContextState()
      return <ChildComponent />
    }

    const { container } = render(
      <ContextWrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={emptyState}>
        <Component />
      </ContextWrapper>,
    )

    expect(container.textContent?.trim()).toBe('Error')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render children component without user custom context', () => {
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }

    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Child component')
    expect(value).toStrictEqual('test')
    expect(state).toStrictEqual(stateValue)
  })

  it('should render the Skeleton component when isActual is false without user custom context', () => {
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', isActual: false }

    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Skeleton')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render the Skeleton component when isLoading is true and isActual is false without user custom context', () => {
    const stateValue: HookCommonState<string | undefined> = {
      ...emptyState,
      value: 'test',
      isActual: false,
      isLoading: true,
    }

    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Skeleton')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when there is an error without user custom context', () => {
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', error: 'error' }

    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Error')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('should render the ErrorState component when value is undefined without user custom context', () => {
    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={emptyState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Error')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('check isValueValid props on empty value', () => {
    const {
      strictValueHook: useStrictValue,
      stateHook: useUncontestedState,
      wrapper: Wrapper,
    } = createStateContextEnvironment<string>(contextName, { isValueValid: () => true })
    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={emptyState}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Child component')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(emptyState)
  })

  it('check isValueValid props on valid value', () => {
    const {
      strictValueHook: useStrictValue,
      stateHook: useUncontestedState,
      wrapper: Wrapper,
    } = createStateContextEnvironment<string>(contextName, {
      isValueValid: (value) => value === 'test',
    })
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }
    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Child component')
    expect(value).toStrictEqual('test')
    expect(state).toStrictEqual(stateValue)
  })

  it('check isValueValid props on not valid value', () => {
    const {
      strictValueHook: useStrictValue,
      stateHook: useUncontestedState,
      wrapper: Wrapper,
    } = createStateContextEnvironment<string>(contextName, { isValueValid: (value) => value === 'test' })
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'not valid test' }
    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Error')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })

  it('check isValueValid props on valid value, but with error', () => {
    const {
      strictValueHook: useStrictValue,
      stateHook: useUncontestedState,
      wrapper: Wrapper,
    } = createStateContextEnvironment<string>(contextName, { isValueValid: (value) => value === 'test' })
    const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', error: 'error' }
    let value
    let state

    const Component = () => {
      value = useStrictValue()
      state = useUncontestedState()
      return <ChildComponent />
    }

    const { container } = render(
      <Wrapper Skeleton={Skeleton} ErrorState={ErrorState} stateValue={stateValue}>
        <Component />
      </Wrapper>,
    )

    expect(container.textContent?.trim()).toBe('Error')
    expect(value).toStrictEqual(undefined)
    expect(state).toStrictEqual(undefined)
  })
})
