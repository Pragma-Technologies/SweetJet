import { HookCommonState } from './CommonState'

export type CombineHookCommonStateTupleStates<T extends [...HookCommonState[]]> = T extends [
  HookCommonState<infer Head>,
  ...infer Tail,
]
  ? Tail extends HookCommonState[]
    ? [Head, ...CombineHookCommonStateTupleStates<Tail>]
    : []
  : []

export type CombineHookCommonStateTupleErrors<T extends [...HookCommonState[]]> = T extends [
  HookCommonState<unknown, infer Head>,
  ...infer Tail,
]
  ? Tail extends HookCommonState[]
    ? [Head | undefined, ...CombineHookCommonStateTupleStates<Tail>]
    : []
  : []

export type CombineHookCommonStateArrayStates<T extends HookCommonState[]> = T extends HookCommonState<infer S>[]
  ? S[]
  : never

export type CombineHookCommonStateArrayErrors<T extends [...HookCommonState[]]> = T extends HookCommonState<
  unknown,
  infer E
>[]
  ? E[]
  : never

export type CombineHookCommonStateStates<T extends HookCommonState[]> = T extends [
  HookCommonState,
  ...HookCommonState[],
]
  ? CombineHookCommonStateTupleStates<T>
  : T extends HookCommonState[]
  ? CombineHookCommonStateArrayStates<T>
  : never

export type CombineHookCommonStateErrors<T extends [...HookCommonState[]]> = T extends [
  HookCommonState,
  ...HookCommonState[],
]
  ? CombineHookCommonStateTupleErrors<T>
  : T extends HookCommonState[]
  ? CombineHookCommonStateArrayErrors<T>
  : never

export type CombineHookCommonState<T extends HookCommonState[]> = HookCommonState<
  CombineHookCommonStateStates<T>,
  { error: CombineHookCommonStateErrors<T>[] }
>
