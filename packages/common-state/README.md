# CommonState

`CommonState` is about simple managing async states.

## Interfaces

Base state entity interfaces type

```ts
interface State<T = unknown, E = unknown> {
  value: T
  error: E | undefined
  isLoading: boolean
  isActual: boolean
}

export interface Cacheable<T = unknown> {
  cached?: T
}

interface Refreshable {
  softRefresh: () => Destructor | void
  hardRefresh: () => Destructor | void
}

interface CacheableState<T = unknown, E = unknown> extends State<T, E>, Cacheable<T> {}
interface RefreshableState<T = unknown, E = unknown> extends State<T, E>, Refreshable {}

interface CommonState<T = unknown, E = unknown> extends State<T, E>, Refreshable, Cacheable<T> {}
```

Short field description:
- `value` - stored value
- `error` - last error on value update
- `isLoading` - is loading new value right now
- `isActual` - is current value is actual or need update for actualizing
- `cached` - last loaded actual value
- `softRefresh` - update value without resetting actuality (emit load new value, set `isLoading` to `true` until wait new value, after update set `isActual` as `true`)
- `hardRefresh` - update value with resetting actuality (emit load new value, set `isLoading` to `false` and `isActual` to `false` until wait new value)

## Usage

For init and manage `CommonState` use `useCommonState` hook.

```ts
interface StateRefreshOption<T, E> {
  refreshFn: () => Promise<T>
  requestKey?: string
  onError?: (error: E, state: CacheableState<T, E>) => void
}

interface StateManager<T = unknown, E = unknown> {
  state: CommonState<T, E>
  setState: Dispatch<SetStateAction<State<T, E>>>
  setRefresh: (params: StateRefreshOption<T, E>) => void
}

// without initial value
function useCommonState<Value, Error = unknown>(initial?: undefined): StateManager<Value | undefined, Error> {}
// with initial value
function useCommonState<Value, Error = unknown>(initial: Value | (() => Value)): StateManager<Value, Error> {}
```

Inputs:
- `initial` - could be optional, if initial `value` of `CommonState` is `undefined`

Outputs (returned object fields):
- `state` - associated `CommonState`
- `setState` - for update state directly (for your custom logic of state behaviour). Not recommended for use without an urgent need
- `setRefresh` - set refresh function, on error callback handler and request key for caching requests

Usage example:

```tsx
function examples(url: string, slug: string): CommonState<ReturnType | undefined> {
  const { state, setRefreshFn } = useCommonState<ReturnType>()

  useEffect(() => {
    // function for get value for CommonState
    const refreshFn = () => getEntityDetails(url, slug)
    // on catch updating error
    const onError = (error)=> console.error('EntityDetails', error)
    // key for memoize request calls
    const requestKey = `${url}_${slug}`
    // set makeRequest as refresh function for state
    setRefreshFn({ refreshFn: makeRequest, requestKey: requestKey })
  }, [url, slug])

  // set refreshing state 
  useEffect(state.hardRefresh, [url, slug])

  return state
}
```

## Utils

### useMapCommonState

For mapping `CommonState` value

```ts
const state: CommonState<ReturnType | undefined> = useCommonState<ReturnType>()

//  ...

const mappedState: CommonState<MappedType | undefined> = useMapCommonState(
  state,
  (value: ReturnType | undefined): MappedType | undefined => {
    // ... return mapped value
  },
  [additionalDeps]
)
```

### useCombineCommonStates

For combine few `CommonState` values in one `CommonState` in array of values

```ts
const state1: CommonState<ReturnType1> = useSomeCommonState1<ReturnType1>(init1)
const state2: CommonState<ReturnType2> = useSomeCommonState2<ReturnType2>(init2)
const state3: CommonState<ReturnType3> = useSomeCommonState3<ReturnType3>(init3)

//  ...

const combinedState: CommonState<[ReturnType1, ReturnType2, ReturnType3]> = useCombineCommonStates(state1, state2, state3)
```
