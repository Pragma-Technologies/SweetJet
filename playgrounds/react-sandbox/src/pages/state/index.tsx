import {
  AtomStatesBaseStorage,
  BaseStatesStorage,
  CommonState,
  getAtomStrictWrapper,
  StrictStorageWrapper,
  useAtomStateValue,
  useAtomStorageCommonState,
  useStrictAtomStateValue,
} from '@pragma-web-utils/common-state'
import { wait } from '@pragma-web-utils/core'
import { Deps, useMountEffectFactory } from '@pragma-web-utils/hooks'
import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react'

// ========= setup state utils
const testStateStore = new AtomStatesBaseStorage<BaseStatesStorage>()
const TestStoreCommonWrapper = getAtomStrictWrapper(testStateStore)
// strict wrapper
const TestStoreWrapper: FC<
  { stateKeys: string[] } & Omit<PropsWithChildren<StrictStorageWrapper<BaseStatesStorage, string>>, 'stateKey'>
> = ({ children, skeleton, error, stateKeys: [stateKey, ...stateKeys] }) => {
  return (
    <TestStoreCommonWrapper stateKey={stateKey} skeleton={skeleton} error={error}>
      {stateKeys.length ? (
        <TestStoreWrapper stateKeys={stateKeys} skeleton={skeleton} error={error}>
          {children}
        </TestStoreWrapper>
      ) : (
        children
      )}
    </TestStoreCommonWrapper>
  )
}

const useStrictValue = (key: string) => useStrictAtomStateValue(testStateStore, key)
const useStateValue = (key: string) => useAtomStateValue(testStateStore, key)

const useAtomCommonState = useAtomStorageCommonState(testStateStore)
// ========= end setup state utils

const local1 = 'local1'
const local2 = 'local2'
const global1 = 'global1'
const global2 = 'global2'

type counterKey = 'local1' | 'local2' | 'global1' | 'global2'
const counter: Record<counterKey, number> = {
  [local1]: 0,
  [local2]: 0,
  [global1]: 0,
  [global2]: 0,
} as const
// universal common state hook (in real cases use own custom hooks)
const useTestCommonState = (
  key: counterKey,
  deps: Deps<string> = [],
  refreshActualityOnChange = false,
): CommonState<number> => {
  const { state, setRefresh, resetStateActuality } = useAtomCommonState<number>(key)
  const useMountEffect = useMountEffectFactory()

  useEffect(() => {
    setRefresh({
      requestKey: deps.join('_') + '_' + key,
      refreshFn: async () => {
        await wait(1000)
        return counter[key]++
      },
    })
  }, [deps.join('_')])

  useMountEffect({
    callback: () => (refreshActualityOnChange ? resetStateActuality() : state.hardRefresh()),
    onInit: () => {
      if (!state.isActual || state.error) {
        return refreshActualityOnChange ? resetStateActuality() : state.hardRefresh()
      }
    },
    deps: [deps.join('_')],
  })

  return state
}

// setup auto refresher TODO: add it to library
export const useStateAutoRefresh = (...states: Deps<CommonState<unknown, unknown, unknown>>): void => {
  const useMountEffect = useMountEffectFactory()

  states.forEach((state) => {
    useMountEffect({
      callback: () => {
        return state.softRefresh()
      },
      onInit: () => {
        if (!state.isActual || state.error) {
          return state.softRefresh()
        }
      },
      deps: [state.key],
    })
  })
}

export const StatePage: FC = () => {
  // imitation of global1 dependence changed
  const [key, setKey] = useState(local1)
  const [globalStateKey, setGlobalStateKey] = useState('global1')
  const counterRef = useRef(0)

  useTestCommonState(global1, [globalStateKey])
  const { hardRefresh } = useTestCommonState(global2, [globalStateKey], true)

  return (
    <>
      <div>global1 key: {globalStateKey}</div>
      <button onClick={() => setGlobalStateKey(`${global1}_${counterRef.current++}`)}>update global1 key</button>
      <button onClick={() => hardRefresh()}>refresh global2</button>
      <div>current tab {key}</div>
      <div>
        <button onClick={() => setKey(local1)} style={{ color: local1 === key ? 'red' : 'black' }}>
          local1
        </button>
        <button onClick={() => setKey(local2)} style={{ color: local2 === key ? 'red' : 'black' }}>
          local2
        </button>
      </div>
      {local1 === key && <TestStateContent1 />}
      {local2 === key && <TestStateContent2 />}
    </>
  )
}

const TestStateContent1: FC = () => {
  const state = useTestCommonState(local1)

  return (
    <>
      <button onClick={() => state.hardRefresh()}>new</button>
      <TestStoreWrapper stateKeys={[local1, global1]} error={() => <>error</>} skeleton={() => <>loading</>}>
        <TestStateStrictContent stateKey={local1} />
      </TestStoreWrapper>
    </>
  )
}
const TestStateContent2: FC = () => {
  const state = useTestCommonState(local2)
  const globalState = useStateValue(global2)

  useStateAutoRefresh(globalState)

  return (
    <>
      <button onClick={() => state.hardRefresh()}>refresh local</button>
      <TestStoreWrapper stateKeys={[local2, global1, global2]} error={() => <>error</>} skeleton={() => <>loading</>}>
        <TestStateStrictContent stateKey={local2} />
        <TestStateStrictContent2 />
      </TestStoreWrapper>
    </>
  )
}

const TestStateStrictContent: FC<{ stateKey: string }> = ({ stateKey: key }) => {
  const value = useStrictValue(key)
  const global = useStrictValue(global1)
  return (
    <>
      <div>local value: {value}</div>
      <div>global1 value: {global}</div>
    </>
  )
}

const TestStateStrictContent2: FC = () => {
  const global = useStrictValue(global2)
  return (
    <>
      <div>global2 value: {global}</div>
    </>
  )
}
