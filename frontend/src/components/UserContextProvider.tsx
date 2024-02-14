import { useState, useEffect, ReactElement } from "react"
import { PlayerType } from "../types"
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
    const { socket } = useSocketContext()

    useEffect(() => {
        function setPlayerInfosInLocalStorage(player: PlayerType) {
          if (player.sessionId){
          localStorage.setItem('sessionId', player.sessionId)}
          else{
            console.log('Error: player.sessionId is undefined')
          }
          localStorage.setItem('userId', player.userId)
          localStorage.setItem('username', player.username)
          localStorage.setItem('imageName', player.imageName)
          setUsername(player.username)
          setImageName(player.imageName)
        }
        socket.on('session', setPlayerInfosInLocalStorage)
        return () => {
          socket.off('session', setPlayerInfosInLocalStorage)
        }
    
      }, [socket])

      return(
        <UserContext.Provider value={{
            sessionId: sessionId, setSessionId: setSessionId,
            userId: userId, setUserId: setUserId,
            username: username, setUsername: setUsername,
            imageName: imageName, setImageName: setImageName
          }}>
            {children}
        </UserContext.Provider>
      )


}