import {
  CommonState,
  CommonStatesStorage,
  getStrictWrapper,
  registerCommonStateStorage,
  useCommonState,
  useRegisterStateToStorage,
  useStateValue,
  useStorageCommonState,
  useStrictStateValue,
} from '@pragma-web-utils/common-state'
import { wait } from '@pragma-web-utils/core'
import { Deps } from '@pragma-web-utils/hooks'
import { EffectCallback, FC, useEffect, useRef, useState } from 'react'
import { useAccount } from '../../services/accountService/AccountsService'
import { useConnectorService } from '../../services/accountService/ChosenConnectorsService'

const testStateStore = new CommonStatesStorage()
const TestStateStoreContext = registerCommonStateStorage(testStateStore)
const TestStoreWrapper = getStrictWrapper(TestStateStoreContext)
console.log(testStateStore)

const useStrictValue = (key: string) => useStrictStateValue(TestStateStoreContext, key)

const useCommonState2 = useStorageCommonState(TestStateStoreContext)
const useTestCommonState = (key: string, deps: Deps<string> = []): CommonState<number> => {
  const counterRef = useRef(0)
  const { state, setRefresh } = useCommonState2<number>(key)
  const useMountEffect = useMountEffectFactory()

  useEffect(() => {
    setRefresh({
      requestKey: deps.join('_') + '_' + key,
      refreshFn: async () => {
        await wait(1000)
        return counterRef.current++
      },
    })
  }, [deps.join('_')])

  useMountEffect({
    callback: () => state.hardRefresh(),
    onInit: () => {
      if (!state.isActual || state.error) {
        return state.hardRefresh()
      }
    },
    deps: [deps.join('_')],
  })

  return state
}

export interface MountEffectProps {
  callback?: EffectCallback
  onInit?: EffectCallback
  deps?: Deps
}

export type MountEffect = ({ callback, onInit, deps }: MountEffectProps) => void

export const useMountEffectFactory = (): MountEffect => {
  const initRef = useRef(false)

  return ({ callback, onInit, deps }) =>
    useEffect(() => {
      const destructor = initRef.current ? callback?.() : onInit?.()
      return () => {
        // mark as initiated in destructor, bsc we don't know how many times useMountEffect will be used
        // but destructor is called always after all useEffect callbacks
        initRef.current = true
        destructor?.()
      }
    }, deps)
}

export const useStateAutoRefresh = (...states: Deps<CommonState>): void => {
  const useMountEffect = useMountEffectFactory()

  states.forEach((state) => {
    useMountEffect({
      callback: () => {
        console.log('callback', state.key)
        return state.softRefresh()
      },
      onInit: () => {
        if ((!state.isActual || state.error) && state.key) {
          console.log('onInit', state.key)
          return state.softRefresh()
        }
      },
      deps: [state.key],
    })
  })
}

export const StatePage: FC = () => {
  const { connectorBase } = useConnectorService()
  const { account } = useAccount()[connectorBase]
  const [key, setKey] = useState('key1')
  const [globalStateKey, setGlobalStateKey] = useState('global')
  useTestCommonState('global', [globalStateKey])
  const counterRef = useRef(0)

  return (
    <>
      <div>{account}</div>
      <div>{globalStateKey}</div>
      <button onClick={() => setGlobalStateKey(`global_${counterRef.current++}`)}>new global</button>
      <div>
        <button onClick={() => setKey('key1')}>key1</button>
        <button onClick={() => setKey('key2')}>key2</button>
      </div>
      <TestStateContent stateKey={key} key={key} />
    </>
  )
}

const TestStateContent: FC<{ stateKey: string }> = ({ stateKey: key }) => {
  const state = useTestCommonState(key)

  return (
    <>
      <button onClick={() => state.hardRefresh()}>new</button>
      <TestStoreWrapper stateKey={key} error={() => <>error</>} skeleton={() => <>loading</>}>
        <TestStoreWrapper stateKey={'global'} error={() => <>error</>} skeleton={() => <>loading</>}>
          <TestStateStrictContent stateKey={key} />
        </TestStoreWrapper>
      </TestStoreWrapper>
    </>
  )
}

const TestStateStrictContent: FC<{ stateKey: string }> = ({ stateKey: key }) => {
  const value = useStrictValue(key)
  const global = useStrictValue('global')
  return (
    <>
      <div>{value}</div>
      <div>{global}</div>
    </>
  )
}
