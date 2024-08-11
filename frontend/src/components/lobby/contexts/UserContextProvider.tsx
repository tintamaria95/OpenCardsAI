import { useState, ReactElement, useEffect } from 'react'
import { UserContext } from './UserContext'
import { useSocketContext } from '../../global/contexts/SocketContext'
import { UserFrontType } from '../../../types'

function initFromStorage(key: string) {
  const value = localStorage.getItem(key)
  if (value) {
    return value
  }
  return key
}

export function UserContextProvider({ children }: { children: ReactElement }) {
  const [sessionId, setSessionId] = useState<string | undefined>(initFromStorage('sessionId'))
  const [userId, setUserId] = useState(initFromStorage('userId'))
  const [username, setUsername] = useState(initFromStorage('username'))
  const [imageName, setImageName] = useState(initFromStorage('imageName'))
  const [lobbyId, setLobbyId] = useState<string | undefined>(initFromStorage('lobbyId'))

  const { socket } = useSocketContext()

  useEffect(() => {
    function setUserFromSession(user: UserFrontType) {
      if (user.sessionId) {
        localStorage.setItem('sessionId', user.sessionId)
        localStorage.setItem('username', user.username)
      } else {
        console.log('Error: user.sessionId is undefined')
      }
      setSessionId(user.sessionId)
      setUserId(user.userId)
      setUsername(user.username)
      setLobbyId(user.lobbyId)
    }

    socket.on('session', setUserFromSession)
    return () => {
      socket.off('session', setUserFromSession)
    }
  })

  return (
    <UserContext.Provider
      value={{
        sessionId: sessionId,
        setSessionId: setSessionId,
        userId: userId,
        setUserId: setUserId,
        username: username,
        setUsername: setUsername,
        imageName: imageName,
        setImageName: setImageName,
        lobbyId: lobbyId,
        setLobbyId: setLobbyId
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
