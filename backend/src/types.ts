import { AsyncGameSK } from "./games/skullKing/AsyncGameSK"

type UserFrontType = {
  // sessionId?: string // private
  userId: string // public between users
  username: string
  imageName: string
  lobbyId?: string
}

type LobbyFrontType = {
  id: string
  name: string
  isPublic: boolean
  users: UserFrontType[]
}

type UserBackType = {
  sessionId: string
  userId: string
  username: string
  imageName: string
  createdAt: number
  lobbyId?: string
}

type LobbyBackType = {
  id: string
  name: string
  isPublic: boolean
  createdAt: number
  users: Map<UserBackType['sessionId'], UserBackType>
  game?: AsyncGameSK
}

type LobbyStore = Map<LobbyBackType['id'], LobbyBackType>

export type {
  LobbyStore,
  LobbyBackType,
  UserBackType,
  LobbyFrontType,
  UserFrontType
}
