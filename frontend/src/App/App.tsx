import {
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom'
import './App.css'
import { useEffect } from 'react'
import { UserContextProvider } from '../components/lobby/contexts/UserContextProvider'
import { DisconnectionAlert } from '../components/global/DisconnectionAlert/DisconnectionAlert'
import CurrentLobby from '../pages/CurrentLobby'
import Home from '../pages/Home'
import PublicLobby from '../pages/PublicLobby'
import PrivateLobby from '../pages/PrivateLobby'
import socket from '../socket'
import { LobbyContextProvider } from '../components/lobby/contexts/LobbyContextProvider'
import { GlobalErrorElement } from '../components/global/GlobalErrorElement'
import { SocketContextProvider } from '../components/global/contexts/SocketContextprovider'

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

const router = createBrowserRouter([{ path: '*', Component: Root, errorElement: <GlobalErrorElement/>}])

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
      <SocketContextProvider>
        <>
          <DisconnectionAlert />
          <UserContextProvider>
            <LobbyContextProvider>
              <Outlet />
            </LobbyContextProvider>
          </UserContextProvider>
        </>
      </SocketContextProvider>
    </>
  )
}

export default App
