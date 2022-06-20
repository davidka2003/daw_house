import React from 'react'
import { Routes, Route } from "react-router-dom"
import Dashboard from './components/Dashboard'
import MintingPage from './components/MintingPage'
const App = () => {
  return (
    <Routes >
      <Route path={'/mint'} element={<MintingPage />} />
      <Route path={"*"} element={<MintingPage />} />
      <Route path={"/dashboard"} element={<Dashboard />} />
    </Routes>
  )
}

export default App