import { ActionSK } from "./action/ActionSK"

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
  roundIndex: number,
  roundFirstPlayerIndex: number
  possibleActions: ActionSK['type'][],
  possiblePlayers: string[],
  pileCards: string[],
  contracts: number[],
  nbTricks: number[],
  scores: number[],
  isResetChrono: boolean,
  // Private information
  playerHand: string[]
}

///

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

