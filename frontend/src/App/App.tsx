import { BrowserRouter, Routes, Route } from 'react-router-dom'
import io from 'socket.io-client';
import './App.css'
import Home from '../pages/Home/Home'
import PublicLobby from '../pages/PublicLobby/PublicLobby'
import PrivateLobby from '../pages/PrivateLobby/PrivateLobby'
import InLobby from '../pages/InLobby/InLobby'
import ProtectedRoute from '../components/ProtectedRoute'
import { LobbyInfosType } from '../types/lobbyInfo';

export const lobbyInfos: LobbyInfosType = {
  id: undefined
}

export const backEndUrl = "http://localhost:3000"

export const socket = io(backEndUrl, {
  autoConnect: false
})

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/publiclobby' element={<PublicLobby />} />
        <Route path='/privatelobby' element={<PrivateLobby />} />
        <Route path='/inlobby' element={
          <ProtectedRoute lobbyInfos={lobbyInfos}><InLobby/></ProtectedRoute>
        } />
        <Route path='*' element={<h1>Page not found... Breath and chill</h1>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App

