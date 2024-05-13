import { Server } from "socket.io"
import { ResJoinLobbyFailArgs, ResJoinLobbySuccessArgs, ResStartGameFailArgs, ResStartGameSuccessArgs } from "./responseTypes"


export const ROOMPUBLICLOBBY = 'publiclobby'



export function emitResJoinLobby(io: Server, to: string, args: ResJoinLobbySuccessArgs | ResJoinLobbyFailArgs){
    io.to(to).emit('res-join-lobby', args)
}


export function emitResStartGame(io: Server, to: string, args: ResStartGameSuccessArgs | ResStartGameFailArgs){
   io.to(to).emit('res-start-game', args)
}
