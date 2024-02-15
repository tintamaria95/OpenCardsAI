import { useState, useEffect, ReactElement } from "react"
import { UserFrontType } from "../types"
import { useSocketContext } from "./SocketContext"
import { UserContext } from "./UserContext"

function initFromStorage(key: string) {
    const value = localStorage.getItem(key)
    if (value) {
        return value
    }
    return '...'
}

export function UserContextProvider({children}: {children: ReactElement}) {
    const [sessionId, setSessionId] = useState(initFromStorage('sessionId'))
    const [userId, setUserId] = useState(initFromStorage('userId'))
    const [username, setUsername] = useState(initFromStorage('username'))
    const [imageName, setImageName] = useState(initFromStorage('imageName'))
    const [lobbyId, setLobbyId] = useState(initFromStorage('lobbyId'))
    const { socket } = useSocketContext()

    useEffect(() => {
        function setUserInLocalStorage(user: UserFrontType) {
          if (user.sessionId){
          localStorage.setItem('sessionId', user.sessionId)}
          else{
            console.log('Error: user.sessionId is undefined')
          }
          localStorage.setItem('userId', user.userId)
          localStorage.setItem('username', user.username)
          localStorage.setItem('imageName', user.imageName)
          setUsername(user.username)
          setImageName(user.imageName)
        }
        socket.on('session', setUserInLocalStorage)
        return () => {
          socket.off('session', setUserInLocalStorage)
        }
    
      }, [socket])

      return(
        <UserContext.Provider value={{
            sessionId: sessionId, setSessionId: setSessionId,
            userId: userId, setUserId: setUserId,
            username: username, setUsername: setUsername,
            imageName: imageName, setImageName: setImageName,
            lobbyId: lobbyId, setLobbyId: setLobbyId
          }}>
            {children}
        </UserContext.Provider>
      )


}