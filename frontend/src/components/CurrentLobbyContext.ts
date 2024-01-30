import { createContext, useContext } from "react"
import { LobbyInfosType } from "../types"

type CurrentLobbyContent = {
    currentLobbyInfos?: LobbyInfosType
    setCurrentLobbyInfos: (currentLobbyInfos: LobbyInfosType) => void
  }
  export const CurrentLobbyContext = createContext<CurrentLobbyContent>({
    currentLobbyInfos: undefined,
    setCurrentLobbyInfos: () => {}
  })

  export const useCurrentLobbyContext = () => useContext(CurrentLobbyContext)