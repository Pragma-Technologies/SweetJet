import { CommonState } from './CommonState'

export type CombineHookCommonStateTupleStates<T extends [...CommonState[]]> = T extends [
  CommonState<infer Head>,
  ...infer Tail,
]
  ? Tail extends CommonState[]
    ? [Head, ...CombineHookCommonStateTupleStates<Tail>]
    : []
  : []

export type CombineHookCommonStateTupleErrors<T extends [...CommonState[]]> = T extends [
  CommonState<unknown, infer Head>,
  ...infer Tail,
]
  ? Tail extends CommonState[]
    ? [Head | undefined, ...CombineHookCommonStateTupleErrors<Tail>]
    : []
  : []

export type CombineHookCommonStateTupleInitials<T extends [...CommonState[]]> = T extends [
  CommonState<unknown, unknown, infer Head>,
  ...infer Tail,
]
  ? Tail extends CommonState[]
    ? [Head, ...CombineHookCommonStateTupleInitials<Tail>]
    : []
  : []

export type CombineHookCommonStateArrayStates<T extends CommonState[]> = T extends CommonState<infer S>[] ? S[] : never

export type CombineHookCommonStateArrayErrors<T extends [...CommonState[]]> = T extends CommonState<unknown, infer E>[]
  ? E[]
  : never

export type CombineHookCommonStateStates<T extends CommonState[]> = T extends [CommonState, ...CommonState[]]
  ? CombineHookCommonStateTupleStates<T>
  : T extends CommonState[]
  ? CombineHookCommonStateArrayStates<T>
  : never

export type CombineHookCommonStateErrors<T extends [...CommonState[]]> = T extends [CommonState, ...CommonState[]]
  ? CombineHookCommonStateTupleErrors<T>
  : T extends CommonState[]
  ? CombineHookCommonStateArrayErrors<T>
  : never

export type CombineHookCommonStateInitials<T extends CommonState[]> = T extends [CommonState, ...CommonState[]]
  ? CombineHookCommonStateTupleStates<T>
  : T extends CommonState[]
  ? CombineHookCommonStateArrayStates<T>
  : never

export type CombineHookCommonState<T extends CommonState[]> = CommonState<
  CombineHookCommonStateStates<T>,
  { error: CombineHookCommonStateErrors<T>[] },
  CombineHookCommonStateInitials<T>
>
