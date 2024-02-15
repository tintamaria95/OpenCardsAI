import { createContext, useContext } from "react"
import { LobbyFrontType } from "../types"

type CurrentLobbyContent = {
    currentLobby?: LobbyFrontType
    setCurrentLobby: (currentLobby: LobbyFrontType | undefined) => void
  }
  export const CurrentLobbyContext = createContext<CurrentLobbyContent>({
    currentLobby: undefined,
    setCurrentLobby: () => {}
  })

  export const useCurrentLobbyContext = () => useContext(CurrentLobbyContext)