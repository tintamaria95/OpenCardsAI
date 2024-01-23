type LobbyInfosType = {
  id: string | undefined,
  name?: string
  players?:{
    id: string | undefined
    name: string
  }[]
}

export { LobbyInfosType }