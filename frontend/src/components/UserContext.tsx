import { createContext, useContext } from "react"

type UserContent = {
    sessionId: string | undefined,
    setSessionId: (sessionId: string | undefined) => void,
    userId: string,
    setUserId: (userId: string) => void,
    username: string,
    setUsername: (username: string) => void
    imageName: string,
    setImageName: (imageName: string) => void,
    lobbyId: string | undefined,
    setLobbyId: (lobbyId: string | undefined) => void
}

export const UserContext = createContext<UserContent>({
    sessionId: 'sessionId',
    setSessionId: () => {},
    userId: 'userId',
    setUserId: () => {},
    username: 'username',
    setUsername: () => {},
    imageName: 'userImageTemplate.png',
    setImageName: () => {},
    lobbyId: 'lobbyId',
    setLobbyId: () => {}
})


export const useUserContext = () => useContext(UserContext)