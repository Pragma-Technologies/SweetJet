export type Destructor = () => void
export type Deps<T = unknown> = [] | [T, ...T[]]
