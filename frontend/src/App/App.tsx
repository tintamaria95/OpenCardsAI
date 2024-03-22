import {
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom'
import './App.css'
import { useEffect } from 'react'
import { UserContextProvider } from '../contexts/UserContextProvider'
import { SocketContext } from '../contexts/SocketContext'
import { DisconnectionAlert } from '../components/DisconnectionAlert/DisconnectionAlert'
import CurrentLobby from '../pages/CurrentLobby'
import Home from '../pages/Home'
import PublicLobby from '../pages/PublicLobby'
import PrivateLobby from '../pages/PrivateLobby'
import socket from '../socket'
import { CurrentLobbyContextProvider } from '../contexts/CurrentLobbyContextProvider'

function Root() {
  return (
    <Routes>
      <Route element={<AppLogic />}>
        <Route element={<Menu />}>
          <Route path="/" element={<Home />} />
          <Route path="/publiclobby" element={<PublicLobby />} />
          <Route path="/privatelobby" element={<PrivateLobby />} />
        </Route>
        <Route path="/play" element={<CurrentLobby />} />
      </Route>
    </Routes>
  )
}

const router = createBrowserRouter([{ path: '*', Component: Root }])

function App() {
  return <RouterProvider router={router} />
}

function Menu() {
  useEffect(() => {
    socket.emit('join-menu')
  }, [])
  return <Outlet />
}

function AppLogic() {
  useEffect(() => {
    function logEventsForDebug(event: string) {
      console.log(`got ${event}`)
    }
    socket.onAny(logEventsForDebug)
    return () => {
      socket.offAny(logEventsForDebug)
    }
  })

  return (
    <>
      <SocketContext.Provider value={{ socket: socket }}>
        <DisconnectionAlert />
        <UserContextProvider>
          <CurrentLobbyContextProvider>
            <Outlet />
          </CurrentLobbyContextProvider>
        </UserContextProvider>
      </SocketContext.Provider>
    </>
  )
}

export default App
