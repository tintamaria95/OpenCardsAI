import { Routes, Route } from 'react-router-dom'
import io from 'socket.io-client';
import './App.css'
import Home from '../pages/Home'
import PublicLobby from '../pages/PublicLobby'
import PrivateLobby from '../pages/PrivateLobby'
import CurrentLobby from '../pages/CurrentLobby';
import ProtectedRoute from '../components/ProtectedRoute'
import { useEffect, useState } from 'react';
import { LobbyInfosType } from '../types';
import { CurrentLobbyContext } from '../components/CurrentLobbyContext';
import { SocketContext } from '../components/SocketContext';
import { DisconnectionAlert } from '../components/DisconnectionAlert/DisconnectionAlert';

const backEndUrl = "http://localhost:3000"
const socket = io(backEndUrl, {
  autoConnect: false
})

function App() {

  const [currentLobbyInfos, setCurrentLobbyInfos] = useState<LobbyInfosType | undefined>(undefined)

  useEffect(()=>{
    function logEventsForDebug(event: any){
      console.log(`got ${event}`)
    }

    socket.onAny(logEventsForDebug)

    return() => {
      socket.offAny(logEventsForDebug)
    }
  }, [])

  return (
    <>
      <SocketContext.Provider value={{ socket: socket }}>
        <DisconnectionAlert />
        <CurrentLobbyContext.Provider value={{ currentLobbyInfos: currentLobbyInfos, setCurrentLobbyInfos }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/publiclobby' element={<PublicLobby />} />
            <Route path='/privatelobby' element={<PrivateLobby />} />
            <Route path='/play' element={
              <ProtectedRoute><CurrentLobby /></ProtectedRoute>
            } />
            <Route path='*' element={<h1>Page not found... Breath and chill</h1>} />
          </Routes>
        </CurrentLobbyContext.Provider>
      </SocketContext.Provider>
    </>

  )
}

export default App

