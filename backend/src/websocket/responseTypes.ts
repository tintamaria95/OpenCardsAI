import { LobbyFrontType } from "../lobby/Lobby"

/// JOIN LOBBY

export type ResJoinLobbySuccessArgs = {
    status: 'success',
    lobby: LobbyFrontType
}

export type ResJoinLobbyFailArgs = {
    status: 'fail',
    errorMessage: string
}


/// START GAME

export  type ResStartGameSuccessArgs = {
    status: 'success'
}

export type ResStartGameFailArgs = {
    status: 'fail',
    errorMessage: string
}