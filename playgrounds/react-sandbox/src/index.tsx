import { Buffer } from 'buffer'
import React from 'react'
import { render } from 'react-dom'
import './index.css'

window.Buffer = window.Buffer || Buffer
const start = async () => {
  const { App } = await import('./App')
  const root = document.getElementById('root')
  render(<App />, root)
}
start()
