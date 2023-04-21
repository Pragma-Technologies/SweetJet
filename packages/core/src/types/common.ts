export type Defined<T = unknown> = T extends undefined | null ? never : T
