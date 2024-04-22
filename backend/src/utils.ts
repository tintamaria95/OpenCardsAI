type FrontErrorArgs = incorrectNumberOfPlayersError | gameAlreadyStartedError | userAlreadyInLobbyError

type incorrectNumberOfPlayersError = {
    type: "incorrectNumberOfPlayers",
    minPlayers: number,
    maxPlayers: number,
    currentNbPlayers: number
}

type gameAlreadyStartedError = {
    type: "gameAlreadyStartedError"
}

type userAlreadyInLobbyError = {
    type: "userAlreadyInLobby"
}

export function getFrontErrorMessage(error: FrontErrorArgs){
    if (error['type'] === 'incorrectNumberOfPlayers'){
        if (error['currentNbPlayers'] < error['minPlayers']){
            return `Not enough players in Lobby to begin the game. (minimum: ${error['minPlayers']})`
        } else if (error['currentNbPlayers'] > error['maxPlayers']){
            return `Too many players in Lobby to begin the game. (maximum: ${error['maxPlayers']})`
        }
    } else  if (error['type'] === "gameAlreadyStartedError"){
        return 'You cannot join a game which has already started'
    } else if (error['type'] === "userAlreadyInLobby"){
        return 'You are already playing in this lobby'
    }
    return ''
}
