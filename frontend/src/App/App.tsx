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
import { ForceHomePath } from '../components/ProtectedRoutes';

const backEndUrl = "http://localhost:3000"
const socket = io(backEndUrl, {
  autoConnect: false
})


function App() {

  const [currentLobby, setCurrentLobby] = useState<LobbyFrontType | undefined>(undefined)
  const navigate = useNavigate()
  const [isActivated, setIsActivated] = useState(true)

  useEffect(() => {

    function logEventsForDebug(event: string) {
      console.log(`got ${event}`)
    }
    function updateLobby(lobby: LobbyFrontType) {
      setCurrentLobby(lobby)
    }
    function resNavigateToLobby(status: string, lobby: LobbyFrontType) {
      if (status === 'success'){
      setCurrentLobby(lobby)
      navigate('/play')}
      else {
        // TODO handle message error parsing status message
      }
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
              <Route path='/' element={<Home setIsActivated={setIsActivated}/>} errorElement={<h1>Oops... An error occured somewhere</h1>} />
              <Route path='*' element={
                <ForceHomePath isActivated={isActivated}>
                  <Routes>
                    <Route path='/publiclobby' element={<PublicLobby />} />
                    <Route path='/privatelobby' element={<PrivateLobby />} />
                    <Route path='/play' element={<CurrentLobby />}/>
                  </Routes>
                </ForceHomePath>} />
            </Routes>
          </CurrentLobbyContext.Provider>
        </UserContextProvider>
      </SocketContext.Provider>
    </>

  )
}

export default App

