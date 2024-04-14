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
import { GlobalErrorElement } from '../components/GlobalErrorElement'
import { useCurrentLobbyContext } from '../contexts/CurrentLobbyContext'

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
  const { setCurrentLobby } = useCurrentLobbyContext()
  useEffect(() => {
    setCurrentLobby(undefined)
    socket.emit('join-menu')
  }, [setCurrentLobby])
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
