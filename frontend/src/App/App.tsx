import { Routes, Route, useNavigate } from 'react-router-dom'
import io from 'socket.io-client';
import './App.css'
import CurrentLobby from '../pages/CurrentLobby';
import { useEffect, useState } from 'react';
import { LobbyFrontType } from '../types';
import { CurrentLobbyContext } from '../components/CurrentLobbyContext';
import { UserContextProvider } from '../components/UserContextProvider';
import { SocketContext } from '../components/SocketContext';
import { DisconnectionAlert } from '../components/DisconnectionAlert/DisconnectionAlert';
import Home from '../pages/Home';
import PublicLobby from '../pages/PublicLobby';
import PrivateLobby from '../pages/PrivateLobby';
import { ProtectedRouteCurrentLobby, ProtectedRouteUsername } from '../components/ProtectedRoutes';

const backEndUrl = "http://localhost:3000"
const socket = io(backEndUrl, {
  autoConnect: false
})


function App() {

  const [currentLobby, setCurrentLobby] = useState<LobbyFrontType | undefined>(undefined)
  const navigate = useNavigate()

  useEffect(() => {

    function logEventsForDebug(event: string) {
      console.log(`got ${event}`)
    }
    function updateLobby(lobby: LobbyFrontType) {
      setCurrentLobby(lobby)
    }
    function resNavigateToLobby(lobby: LobbyFrontType) {
      setCurrentLobby(lobby)
      navigate('/play')
    }

    socket.onAny(logEventsForDebug)
    socket.on('res-join-lobby', resNavigateToLobby)
    socket.on('update-currentlobby', updateLobby)
    return () => {
      socket.offAny(logEventsForDebug)
      socket.off('update-currentlobby', updateLobby)
      socket.off('res-join-lobby', resNavigateToLobby)
    }
  }, [socket])

  useEffect(() => {
    if (!socket.connected) {
      const sessionId = localStorage.getItem('sessionId')
      socket.auth = { sessionId: sessionId }
      socket.connect()
    }
  }, [socket])


  return (
    <>
      <SocketContext.Provider value={{ socket: socket }}>
        <DisconnectionAlert />
        <UserContextProvider>
          <CurrentLobbyContext.Provider value={{ currentLobby: currentLobby, setCurrentLobby }}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/publiclobby' element={<ProtectedRouteUsername><PublicLobby /></ProtectedRouteUsername>} />
              <Route path='/privatelobby' element={<ProtectedRouteUsername><PrivateLobby /></ProtectedRouteUsername>} />
              <Route path='/play' element={
                <ProtectedRouteCurrentLobby><CurrentLobby /></ProtectedRouteCurrentLobby>
              } />
              <Route path='*' element={<h1>Page not found... Breath and chill</h1>} />
            </Routes>
          </CurrentLobbyContext.Provider>
        </UserContextProvider>
      </SocketContext.Provider>
    </>

  )
}

export default App

