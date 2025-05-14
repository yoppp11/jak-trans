import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1 className="text-3xl font-bold">Vite + React + Tailwind CSS</h1>
        <div className="card">
          <button className="btn" onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p className="text-sm text-gray-500">Click on the Vite and React logos to learn more</p>
        </div>
      </div>
    </>
  )
}

export default App
