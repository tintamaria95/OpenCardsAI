import { createContext, useContext } from 'react'
import { LobbyFrontType } from '../../../types'

type CurrentLobbyContent = {
  currentLobby?: LobbyFrontType
  errorMessage: string,
  isWaitingForPlayersToJoin: boolean
}

export const LobbyContext = createContext<CurrentLobbyContent>({
  currentLobby: undefined,
  errorMessage: '',
  isWaitingForPlayersToJoin: true
})

export const useLobbyContext = () => useContext(LobbyContext)
