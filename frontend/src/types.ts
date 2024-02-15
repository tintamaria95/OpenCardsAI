type UserFrontType = {
  sessionId?: string, // private
  lobbyId?: string, // private
  userId: string, // public between users
  username: string,
  imageName: string
}

type LobbyFrontType = {
  id: string,
  name: string,
  isPublic: boolean,
  users: UserFrontType[]
}

type UserBackType = {
  sessionId: string
  userId: string
  lobbyId: string | undefined
  username: string
  imageName: string,
  createdAt: number,
}

type LobbyBackType = {
  id: string,
  name: string,
  isPublic: boolean,
  createdAt: number,
  users: Map<UserBackType['sessionId'], UserBackType>
}

type LobbyStore = Map<LobbyBackType['id'], LobbyBackType>


export type { LobbyStore, LobbyBackType, UserBackType, LobbyFrontType, UserFrontType }