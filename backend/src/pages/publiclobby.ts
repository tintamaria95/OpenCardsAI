import { Request, Response } from 'express'
import { LobbyInfo } from '../type/LobbyInfo'
import logger from '../logger'

async function handlePublicLobbiesGET(res: Response, lobbiesList: LobbyInfo[]) {
  res.json(lobbiesList)
}

async function handlePublicLobbiesPOST(req: Request, res: Response, lobbiesList: LobbyInfo[]) {
  // lobbiesList.push({name:"name", numberOfPlayers: 2, status: "OK"})
  try {
    const data = req.body as LobbyInfo
    lobbiesList.push({ name: data.name, numberOfPlayers: data.numberOfPlayers, status: data.status })
    res.json({ status: "success" })
  } catch (err) {
    logger.error("Error while trying to cast req.body from POST request on /publiclobby and push it to LobbyList")
    res.json({ status: "fail" })
  }
}

export { handlePublicLobbiesGET, handlePublicLobbiesPOST }
