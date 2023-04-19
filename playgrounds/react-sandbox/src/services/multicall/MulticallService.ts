import { MulticallRequestCollector } from '@pragma-web-utils/core'
import { createContext, useContext } from 'react'

const multicallCollector = new MulticallRequestCollector()

const MulticallCollectorContext = createContext(multicallCollector)

export const useMulticallCollector = (): MulticallRequestCollector => useContext(MulticallCollectorContext)
