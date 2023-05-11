import { render } from '@testing-library/react'
import React from 'react'
import { CreateStateContextEnvironmentOutput, HookCommonState } from '../types'
import { createStateContextEnvironment } from './createStateContextEnvironment'

type StateEnvironmentTestUtil = {
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
  getStateEnvironment: (isValueValid) =>
    createStateContextEnvironment<string | undefined>(contextName, { userContext: mockContext, isValueValid }),
}

const testUtil2: StateEnvironmentTestUtil = {
  getStateEnvironment: (isValueValid) =>
    createStateContextEnvironment<string | undefined>(contextName, { isValueValid }),
}

describe.each<StateEnvironmentTestUtil>([testUtil1, testUtil2])(
  'createStateContextEnvironment',
  ({ getStateEnvironment }) => {
    const {
      strictValueHook: useStrictValue,
      stateHook: useStateValue,
      strictWrapper: StrictWrapper,
      stateWrapper: StateWrapper,
    } = getStateEnvironment()

    it('should return an object with a hook and a wrapper', () => {
      const stateEnvironment = getStateEnvironment()
      expect(stateEnvironment).toHaveProperty('strictValueHook')
      expect(stateEnvironment).toHaveProperty('stateHook')
      expect(stateEnvironment).toHaveProperty('strictWrapper')
      expect(stateEnvironment).toHaveProperty('stateWrapper')
    })

    it('should render children component', () => {
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }

      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
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
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
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
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
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
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it('should render the ErrorState component when value is undefined', () => {
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={emptyState}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it('check isValueValid props on empty value', () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
      } = getStateEnvironment(() => true)
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={emptyState}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(emptyState)
    })

    it('check isValueValid props on valid value', () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
      } = getStateEnvironment((value) => value === 'test')
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test' }
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Child component')
      expect(value).toStrictEqual('test')
      expect(state).toStrictEqual(stateValue)
    })

    it('check isValueValid props on not valid value', () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
      } = getStateEnvironment((value) => value === 'test')
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'not valid test' }
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })

    it('check isValueValid props on valid value, but with error', () => {
      const {
        strictValueHook: useStrictValue,
        stateHook: useStateValue,
        strictWrapper: StrictWrapper,
      } = getStateEnvironment((value) => value === 'test')
      const stateValue: HookCommonState<string | undefined> = { ...emptyState, value: 'test', error: 'error' }
      let value
      let state

      const Component = () => {
        value = useStrictValue()
        state = useStateValue()
        return <ChildComponent />
      }

      const { container } = render(
        <StrictWrapper skeleton={Skeleton} error={ErrorState} stateValue={stateValue}>
          <Component />
        </StrictWrapper>,
      )

      expect(container.textContent?.trim()).toBe('Error')
      expect(value).toStrictEqual(undefined)
      expect(state).toStrictEqual(undefined)
    })
  },
)
