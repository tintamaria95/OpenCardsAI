import { Routes, Route } from 'react-router-dom'
import io from 'socket.io-client';
import './App.css'
import CurrentLobby from '../pages/CurrentLobby';
import { ProtectedRouteCurrentLobby } from '../components/ProtectedRoutes';
import { useEffect, useState } from 'react';
import { LobbyInfosType } from '../types';
import { CurrentLobbyContext } from '../components/CurrentLobbyContext';
import { UserContextProvider } from '../components/UserContextProvider';
import { SocketContext } from '../components/SocketContext';
import { DisconnectionAlert } from '../components/DisconnectionAlert/DisconnectionAlert';
import { GlobalMenu } from '../components/Menu';

const backEndUrl = "http://localhost:3000"
const socket = io(backEndUrl, {
  autoConnect: false
})


function App() {

  const [currentLobbyInfos, setCurrentLobbyInfos] = useState<LobbyInfosType | undefined>(undefined)

  useEffect(() => {
    function logEventsForDebug(event: string) {
      console.log(`got ${event}`)
    }
    socket.onAny(logEventsForDebug)
    return () => {
      socket.offAny(logEventsForDebug)
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
          <CurrentLobbyContext.Provider value={{ currentLobbyInfos: currentLobbyInfos, setCurrentLobbyInfos }}>
            <Routes>
              <Route path='*' element={<GlobalMenu />} />
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

