type PlayerType = {
  sessionId?: string
  userId: string
  username: string
  imageName: string,
  createdAt?: number,
}

type LobbyInfosType = {
  id: string,
  name: string,
  isPublic: boolean,
  createdAt?: number,
  players:PlayerType[]
}

export type { LobbyInfosType, PlayerType }