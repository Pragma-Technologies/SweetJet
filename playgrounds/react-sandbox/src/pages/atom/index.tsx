import { atom, useAtom } from 'jotai'
import { FC, useState } from 'react'

const counter1 = atom({ first: 0, second: 0 })
// const counter2 = atom(1)

const incrementor = atom(
  (get) => get(counter1).first,
  (get, set) => set(counter1, (prev) => ({ ...prev, first: ++prev.first })),
)
const decrementor = atom(
  (get) => get(counter1).second,
  (get, set) => set(counter1, (prev) => ({ ...prev, second: ++prev.second })),
)

export const AtomPage: FC = () => {
  console.log('render main')
  return (
    <>
      <div>Atom</div>
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
    </>
  )
}

const Component1: FC = () => {
  const [counter, setCounter] = useState(0)

  console.log('render component 1')
  return (
    <>
      <div>{counter}</div>
      <button onClick={() => setCounter((prev) => ++prev)}>+1</button>
    </>
  )
}
const Component2: FC = () => {
  const [counter, setCounter] = useState(0)

  console.log('render component 2')
  return (
    <>
      <div>{counter}</div>
      <button onClick={() => setCounter((prev) => --prev)}>-1</button>
    </>
  )
}

const Component3: FC = () => {
  const [counter, increment] = useAtom(incrementor)

  console.log('render component 3')
  return (
    <>
      <div>{counter}</div>
      <button onClick={() => increment()}>+1</button>
    </>
  )
}
const Component4: FC = () => {
  const [counter, decrement] = useAtom(decrementor)

  console.log('render component 4')
  return (
    <>
      <div>{counter}</div>
      <button onClick={() => decrement()}>-1</button>
    </>
  )
}
