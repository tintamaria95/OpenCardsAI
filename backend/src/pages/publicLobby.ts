import { Request, Response } from 'express'
import { LobbyInfosType } from '../type/LobbyInfo'
import logger from '../logger'

async function handlePublicLobbiesGET(res: Response, lobbiesList: LobbyInfosType[]) {
  res.json(lobbiesList)
}

async function handleCreateLobby(req: Request, res: Response, lobbiesList: LobbyInfosType[]) {
  const data = req.body
  if ('id' in data && 'name' in data && 'players' in data) {
    lobbiesList.push({ id: data.id, name: data.name, players: [{id: data.players[0].id, name: data.players[0].name}]})
    res.json({ status: 'success' })
  } else{
    res.json({status: 'fail'})
  }
}

export { handlePublicLobbiesGET, handleCreateLobby }
