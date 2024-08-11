type GameConfig = {
    timerDuration: number
    nbRounds: number
}

const defaultGameConfig: GameConfig = {
    nbRounds: 10,
    timerDuration: 20
    // with/without whale/gold/kraken cards
    // with/without pirate special skills
}

export { GameConfig, defaultGameConfig }