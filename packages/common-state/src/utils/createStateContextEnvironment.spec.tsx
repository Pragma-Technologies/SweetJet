import { render } from '@testing-library/react'
import React from 'react'
import { CreateStateContextEnvironmentOutput, HookCommonState } from '../types'
import { createStateContextEnvironment } from './createStateContextEnvironment'

type StateEnvironmentTestUtil = {
  name: string
  getStateEnvironment: (
    isValueValid?: (value: string | undefined) => boolean,
  ) => CreateStateContextEnvironmentOutput<string | undefined>
}

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

const testUtil1: StateEnvironmentTestUtil = {
  name: '#1 With context:',
  getStateEnvironment: (isValueValid) =>
    createStateContextEnvironment<string | undefined>(contextName, { userContext: mockContext, isValueValid }),
}

const testUtil2: StateEnvironmentTestUtil = {
  name: '#2 Without context:',
  getStateEnvironment: (isValueValid) =>
    createStateContextEnvironment<string | undefined>(contextName, { isValueValid }),
}

describe.each<StateEnvironmentTestUtil>([testUtil1, testUtil2])(
  'createStateContextEnvironment',
  ({ getStateEnvironment, name }) => {
    const {
      strictValueHook: useStrictValue,
      stateHook: useStateValue,
      strictWrapper: StrictWrapper,
      stateWrapper: StateWrapper,
    } = getStateEnvironment()

    let value: string | undefined
    let state: HookCommonState<string | undefined> | undefined

    const Component = () => {
      value = useStrictValue()
      state = useStateValue()
      return <ChildComponent />
    }

    const strictContent = (stateValue: HookCommonState<string | undefined>) => (
      <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
        <Component />
      </StrictWrapper>
    )

    const strictByStateContent = (stateValue: HookCommonState<string | undefined>) => (
      <StateWrapper stateValue={stateValue}>
        <StrictWrapper skeleton={Skeleton} error={ErrorState}>
          <Component />
        </StrictWrapper>
      </StateWrapper>
    )

    beforeEach(() => {
      value = undefined
      state = undefined
    })

    it(`${name} should return an object with a hook and a wrapper`, () => {
      const stateEnvironment = getStateEnvironment()
      expect(stateEnvironment).toHaveProperty('strictValueHook')
      expect(stateEnvironment).toHaveProperty('stateHook')
      expect(stateEnvironment).toHaveProperty('strictWrapper')
      expect(stateEnvironment).toHaveProperty('stateWrapper')
    })

    it(`${name} should render children component`, () => {
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }

      const { container, rerender } = render(strictContent(stateValue))

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual(stateValue.value)
      expect(state).toEqual(stateValue)

      rerender(strictByStateContent(stateValue))

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual(stateValue.value)
      expect(state).toEqual(stateValue)
    })

    it(`${name} should render the Skeleton component when isActual is false`, () => {
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', isActual: false }

      const { container, rerender } = render(strictContent(stateValue))

      expect(container.textContent?.trim()).toBe('Skeleton')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)

      rerender(strictByStateContent(stateValue))

      expect(container.textContent?.trim()).toBe('Skeleton')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it(`${name} should render the Skeleton component when isLoading is true and isActual is false`, () => {
      const stateValue: HookCommonState<string | undefined> = {
        ...emptyState,
        value: 'test',
        isActual: false,
        isLoading: true,
      }

      const { container, rerender } = render(strictContent(stateValue))

      expect(container.textContent?.trim()).toBe('Skeleton')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)

      rerender(strictByStateContent(stateValue))

      expect(container.textContent?.trim()).toBe('Skeleton')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it(`${name} should render the ErrorState component when there is an error`, () => {
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', error: 'error' }

      const { container, rerender } = render(strictContent(stateValue))

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)

      rerender(strictByStateContent(stateValue))

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it(`${name} should render the ErrorState component when value is undefined`, () => {
      const { container, rerender } = render(strictContent(emptyState))

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)

      rerender(strictByStateContent(emptyState))

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it(`${name} check isValueValid props on empty value`, () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
        stateWrapper: StateWrapper,
      } = getStateEnvironment(() => true)
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container, rerender } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={emptyState}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(emptyState)

      rerender(
        <StateWrapper stateValue={emptyState}>
          <StrictWrapper skeleton={Skeleton} error={ErrorState}>
            <Component />
          </StrictWrapper>
        </StateWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(emptyState)
    })

    it(`${name} check isValueValid props on valid value`, () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
        stateWrapper: StateWrapper,
      } = getStateEnvironment((value) => value === 'test')
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container, rerender } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual('test')
      expect(state).toStrictEqual(stateValue)

      rerender(
        <StateWrapper stateValue={stateValue}>
          <StrictWrapper skeleton={Skeleton} error={ErrorState}>
            <Component />
          </StrictWrapper>
        </StateWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual('test')
      expect(state).toStrictEqual(stateValue)
    })

    it(`${name} check isValueValid props on not valid value`, () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
        stateWrapper: StateWrapper,
      } = getStateEnvironment((value) => value === 'test')
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'not valid test' }
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container, rerender } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)

      rerender(
        <StateWrapper stateValue={stateValue}>
          <StrictWrapper skeleton={Skeleton} error={ErrorState}>
            <Component />
          </StrictWrapper>
        </StateWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it(`${name} check isValueValid props on valid value, but with error`, () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
        stateWrapper: StateWrapper,
      } = getStateEnvironment((value) => value === 'test')
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', error: 'error' }
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container, rerender } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)

      rerender(
        <StateWrapper stateValue={stateValue}>
          <StrictWrapper skeleton={Skeleton} error={ErrorState}>
            <Component />
          </StrictWrapper>
        </StateWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })
  },
)
