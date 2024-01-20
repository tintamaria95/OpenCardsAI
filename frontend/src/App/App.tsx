import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from '../pages/Home/Home'
import PublicLobby from '../pages/PublicLobby/PublicLobby'
import PrivateLobby from '../pages/PrivateLobby/PrivateLobby'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/publiclobby' element={<PublicLobby />} />
        <Route path='/privatelobby' element={<PrivateLobby />} />
        <Route path='*' element={<h1>Page not found... Breath and chill</h1>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App

