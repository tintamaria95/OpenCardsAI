import { Routes, Route, useNavigate, createBrowserRouter, RouterProvider, Outlet  } from 'react-router-dom'
import './App.css'
import { useEffect, useState } from 'react';
import { LobbyFrontType } from '../types';
import { CurrentLobbyContext } from '../components/CurrentLobbyContext';
import { UserContextProvider } from '../components/UserContextProvider';
import { SocketContext } from '../components/SocketContext';
import { DisconnectionAlert } from '../components/DisconnectionAlert/DisconnectionAlert';
import CurrentLobby from '../pages/CurrentLobby';
import Home from '../pages/Home';
import PublicLobby from '../pages/PublicLobby';
import PrivateLobby from '../pages/PrivateLobby';
import socket from '../socket';

const router = createBrowserRouter([
  {path:'*', Component:Root}
])

function Menu() {
  useEffect(() => {
    socket.emit('join-menu')
  }, [])
  return <Outlet />
}

function Root(){
  return (
    <Routes>
      <Route element={<AppLogic />}>
        <Route element={<Menu />}>
          <Route path='/' element={<Home />} />
          <Route path='/publiclobby' element={<PublicLobby />} />
          <Route path='/privatelobby' element={<PrivateLobby />} />
        </Route>
        <Route path='/play' element={<CurrentLobby />} />
      </Route>
    </Routes>
  )
}

function App(){
  return <RouterProvider router={router}/>
}

function AppLogic() {

  const [currentLobby, setCurrentLobby] = useState<LobbyFrontType | undefined>(undefined)
  const navigate = useNavigate()

  useEffect(() => {

    function logEventsForDebug(event: string) {
      console.log(`got ${event}`)
    }
    function updateLobby(lobby: LobbyFrontType) {
      setCurrentLobby(lobby)
    }
    function resNavigateToLobby(status: string, lobby: LobbyFrontType) {
      if (status === 'success') {
        setCurrentLobby(lobby)
        navigate('/play')
      }
    }
    
    socket.onAny(logEventsForDebug)
    socket.on('res-join-lobby', resNavigateToLobby)
    socket.on('update-lobby', updateLobby)
    return () => {
      socket.offAny(logEventsForDebug)
      socket.off('update-lobby', updateLobby)
      socket.off('res-join-lobby', resNavigateToLobby)
    }
  }, [navigate])


  return (
    <>
      <SocketContext.Provider value={{ socket: socket }}>
        <DisconnectionAlert />
        <UserContextProvider>
          <CurrentLobbyContext.Provider value={{ currentLobby: currentLobby, setCurrentLobby }}>
            <Outlet/>
          </CurrentLobbyContext.Provider>
        </UserContextProvider>
      </SocketContext.Provider>
    </>

  )
}

export default App

