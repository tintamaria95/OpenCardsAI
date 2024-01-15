import { Response } from 'express'
import { getPublicLobbies } from '../database/models/Lobby.model'
import logger from '../logger'

async function handlePublicLobbiesReq(res: Response) {
  const currentPublicLobbies = await getPublicLobbies()
  res.send(currentPublicLobbies)
}

export { handlePublicLobbiesReq }
