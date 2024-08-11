import { Action } from "./action/Action"

export type UserFrontType = {
  sessionId?: string // private
  userId: string // public between users
  username: string
  imageName: string
  lobbyId?: string
}

export type LobbyFrontType = {
  id: string
  name: string
  isPublic: boolean
  users: UserFrontType[]
  isGameStarted: boolean
}


export type PlayerFrontState = {
  isGameEnded: boolean,
  roundIndex: number
  roundFirstPlayerIndex: number
  possibleActions: Action['type'][]
  possiblePlayers: string[]
  pileCards: string[]
  contracts: number[]
  nbTricks: number[]
  scores: number[]
  chronoValue?: number
  // Private information
  playerHand: string[]
}


export type ResJoinLobbySuccessArgs = {
  status: 'success',
  lobby: LobbyFrontType
}

export type ResJoinLobbyFailArgs = {
  status: 'fail',
  errorMessage: string
}

export type ResStartGameSuccessArgs = {
  status: 'success'
}

export type ResStartGameFailArgs = {
  status: 'fail',
  errorMessage: string
}

