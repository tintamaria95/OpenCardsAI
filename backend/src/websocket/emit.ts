import { Server } from "socket.io"
import { Lobby, LobbyFrontType } from "../lobby/Lobby"


export const ROOMPUBLICLOBBY = 'publiclobby'

/// LOBBY

type ResJoinLobbySuccessArgs = {
    status: 'success',
    lobby: LobbyFrontType
}

type ResJoinLobbyFailArgs = {
    status: 'fail',
    errorMessage: string
}

export function emitResJoinLobby(io: Server, sessionId: string, args: ResJoinLobbySuccessArgs | ResJoinLobbyFailArgs){
    if (args['status'] === 'success'){
        io.to(args['lobby']['id']).emit('res-join-lobby', args)
    } else {
        io.to(sessionId).emit('res-join-lobby', args)
    }
}
