type PlayerType = {
  id: string
  name: string
}

type LobbyInfosType = {
  id: string,
  name?: string,
  isPublic?: boolean,
  createdAt?: number,
  players:PlayerType[]
}

export type { LobbyInfosType, PlayerType }