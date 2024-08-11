import { randomInt } from 'crypto'
import { DeckSK } from './DeckSK'
import { PlayerSK } from './PlayerSK'
import { PileSK } from './PileSK'
import { gameLogger } from '../../logger'
import { AsyncGame, AsyncGameInterface } from '../commonClasses/AsyncGame'
import { CardSK, SkColors } from './CardSK'
import { ActionSetContract, ActionPlayCard, ActionSK } from './ActionSK'
import { Action } from '../commonClasses/Action'
import { Server } from 'socket.io'
import { GameConfig } from './config'


type PlayerFrontState = {
    isGameEnded: boolean,
    roundIndex: number
    roundFirstPlayerIndex: number
    possibleActions: Action['type'][]
    possiblePlayers: string[]
    pileCards: string[]
    contracts: number[]
    nbTricks: number[]
    scores: number[]
    chronoValue?: number
    // Private information
    playerHand: string[]
}


export class AsyncGameSK extends AsyncGame implements AsyncGameInterface{

    public static readonly minPlayers = 2
    public static readonly maxPlayers = 8

    protected players: PlayerSK[]

    private nbRounds: number
    private roundFirstPlayerIndex: number
    private trickFirstPlayerIndex: number
    private roundIndex: number
    private trickIndex: number
    private pile: PileSK

    private timer?: NodeJS.Timeout
    private minTimerDuration = 10
    private maxTimerduration = 90
    private timerDuration = 20
    private chronoValue = this.timerDuration
    private io?: Server

    constructor(players: PlayerSK[], deck: DeckSK, config: GameConfig, io?: Server) {
        super(players, deck)
        this.players = players
        
        this.nbRounds = Math.min(
            config.nbRounds,
            Math.floor(deck.getDeckSize() / players.length)
        )
        this.roundFirstPlayerIndex = randomInt(this.nbPlayers)
        this.trickFirstPlayerIndex = this.roundFirstPlayerIndex
        this.roundIndex = 1
        this.trickIndex = 0
        this.pile = new PileSK()

        players.forEach((player, index) => {
            this.id2Index.set(player.getSessionId(), index)
        })

        gameLogger.debug('- GAME STARTS -')
        gameLogger.debug(`Round first player: ${players[this.roundFirstPlayerIndex].getSessionId()}`)
        this.distributeCardsToPlayers()
        this.setTimer(config.timerDuration)
        if( io !== undefined){
            this.io = io
        }
        
    }

    public getPlayerState(playerId: string): PlayerFrontState {
        let contracts: number[] = []
        if (this.possibleActions.has('playCard')){
            contracts = this.getContracts()
        }
        return {
            // Public informations
            isGameEnded: this.isGameEnded,
            roundIndex: this.getRoundIndex(),
            roundFirstPlayerIndex: this.getRoundFirstPlayerIndex(),
            possibleActions: this.getPossibleActions(),
            possiblePlayers: this.getPossiblePlayerUserIds(),
            pileCards: this.getPileCards(),
            contracts: contracts,
            nbTricks: this.getNbTricks(),
            scores: this.getScores(),
            chronoValue: this.chronoValue,
            // Private information
            playerHand: this.getPlayerCardIds(playerId)
        }
    }

    public getRoundIndex() {
        return this.roundIndex
    }

    public getRoundFirstPlayerIndex() {
        return this.roundFirstPlayerIndex
    }

    public getPileCards() {
        return this.pile.getCardsIds()
    }

    public getContracts() {
        return this.players.map(player => player.getContract())
    }

    public getNbTricks() {
        const tricks: number[] = []
        this.players.forEach(player => tricks.push(player.getWonTricks()))
        return tricks
    }

    public getScores() {
        const scores: number[] = []
        this.players.forEach(player => scores.push(player.getGameScore()))
        return scores
    }

    private getPlayer(index: number) {
        return this.players[index]
    }

    public getPlayerContract(id: string) {
        const index = this.id2Index.get(id)
        if (index !== undefined) {
            return this.getPlayer(index).getContract()
        }
    }

    public getPlayerNbTricks(id: string) {
        const index = this.id2Index.get(id)
        if (index !== undefined) {
            return this.getPlayer(index).getWonTricks()
        }
    }

    public getPlayerScore(id: string) {
        const index = this.id2Index.get(id)
        if (index !== undefined) {
            return this.getPlayer(index).getGameScore()
        }
    }

    public getPlayerCardIds(id: string) {
        const index = this.id2Index.get(id)
        if (index !== undefined) {
            return this.getPlayer(index).getCardIds()
        } else {
            gameLogger.error(`Id '${id}' undefined in id2Index object. Cannot return player hand (returned empty array).`)
            return []
        }
    }


    /**
    * Returns the score for a given contract and the tricks that a player won during this round. The bonus points are added to the score if the player completed its contract. 
    */
    public score(round: number, contract: number, wonTricks: number, bonusPoints: number) {
        if (contract === 0) {
            if (wonTricks === 0) {
                return round * 10
            } else {
                return round * (-10)
            }
        } else {
            if (contract === wonTricks) {
                return wonTricks * 20 + bonusPoints
            } else {
                return Math.abs(contract - wonTricks) * (-10)
            }
        }
    }

/**
 * 
 * @param action 
 * @param playerId 
 * @returns Return true if calling the function updated the state (changes happened).
 */
    public updateState(action: Action, playerId: string) {
        if (this.isGameEnded) {
            gameLogger.warn('Game ended - No action allowed anymore')
            return false
        }
        if (!this.isActionAllowed(action, playerId)) {
            gameLogger.warn(`State update not allowed | actionType: ${action['type']}, playerId: ${playerId}`)
            return false
        }
        const playerIndex = this.id2Index.get(playerId)
        if (playerIndex === undefined) {
            gameLogger.error(`Logic error: playerId '${playerId}' undefined in map object 'id2Index'`)
            return false
        }
        const player = this.players[playerIndex]
        if (action['type'] === 'setContract') {
            if (this.actionSetContract(action, player)) {
                gameLogger.debug(`Player '${playerId}' sets contracts = ${action['contractValue']}`)
                if (this.isAllContractsSet()) {
                    this.possibleActions.clear()
                    this.possibleActions.add('playCard')
                    this.addPossiblePlayer(this.players[this.roundFirstPlayerIndex])
                    gameLogger.debug('All players have set their contracts. Next phase: PlayCard')
                    this.refreshTimerForNextPlayer()
                }
                return true
            }
        } else if (action['type'] === 'playCard') {
            if (this.actionPlayCard(action, player)) {
                if (this.isAllCardsPlayed()) {
                    gameLogger.debug(`Trick ${this.trickIndex + 1} ended`)
                    this.endTrick()
                } else {
                    this.setForNextPlayer()
                }
                this.refreshTimerForNextPlayer()
                return true
            }
        }
        return false
    }

    private actionSetContract(action: ActionSetContract, player: PlayerSK) {
        if (action['contractValue'] >= 0 && action['contractValue'] <= this.roundIndex && Number.isInteger(action['contractValue'])) {
            player.setContract(action['contractValue'])
            this.possiblePlayerSessionIds.delete(player.getSessionId())
            return true
        } else {
            gameLogger.warn(`Cannot set a contract of value '${action['contractValue']}' at round ${this.roundIndex}`)
            return false
        }
    }

    private actionPlayCard(action: ActionPlayCard, player: PlayerSK) {
        const cardIndexInHand = player.getCardIndex(action['cardId'])
        if (cardIndexInHand !== -1) {
            if (this.isPlayerAllowedToPlayCardInPile(action['cardId'], player, this.pile.getTrickColor())) {
                if (action['cardId'] === 'scaryMary'){
                    if (action['scaryMaryChoice'] === undefined){
                        gameLogger.error(`Scary Mary card must have a value defined as 'pirate' or 'escape' when played.`)
                        return false
                    } 
                }
                const chosenCard = player.playCard(cardIndexInHand)
                if (action['cardId'] === 'scaryMary' && action['scaryMaryChoice'] !== undefined) {
                    chosenCard.value = action['scaryMaryChoice']
                    if (action['scaryMaryChoice'] === 'escape') {
                        chosenCard.category = 'escape'
                    } else {
                        chosenCard.category = 'character'
                    }
                }
                gameLogger.debug(`'${player.getSessionId()}' played ${chosenCard.id}`)
                this.pile.addCard(chosenCard)
                return true
            }
        } else {
            gameLogger.warn(`'${player.getSessionId()}'cannot play card of id '${action['cardId']}'`)
        }
        return false
    }

    /**
     * This methods updates the class variables to allow the next player to do an action.
     */
    private setForNextPlayer() {
        const currentPlayerId = [...this.possiblePlayerSessionIds][0]
        const currentPlayerIndex = this.id2Index.get(currentPlayerId)
        if (currentPlayerIndex === undefined) {
            gameLogger.error(`Unknown player Id '${currentPlayerId}'`)
            return
        }
        const nextPlayerIndex = (currentPlayerIndex + 1) % this.nbPlayers
        this.clearPossiblePlayer()
        this.addPossiblePlayer(this.players[nextPlayerIndex])
    }

    private endTrick() {
        // this.pile.show()
        gameLogger.debug('winning card: ' + this.pile.getCurrentWinningCardIndex().toString())
        this.trickFirstPlayerIndex = (this.trickFirstPlayerIndex + this.pile.getCurrentWinningCardIndex()) % this.nbPlayers
        gameLogger.debug('Trick winner: ' + this.players[this.trickFirstPlayerIndex].getSessionId())
        this.players[this.trickFirstPlayerIndex].incrementWonTricks()
        this.players[this.trickFirstPlayerIndex].addToBonusPoints(this.pile.getBonusPoints())
        this.trickIndex += 1
        this.pile = new PileSK()
        this.clearPossiblePlayer()
        this.addPossiblePlayer(this.players[this.trickFirstPlayerIndex])
        if (this.trickIndex === this.roundIndex) {
            gameLogger.debug(`Round ${this.roundIndex} ended`)
            this.endRound()
        }

    }

    private isAllCardsPlayed() {
        return this.pile.getNbCards() === this.nbPlayers
    }

    private isAllContractsSet() {
        return this.possiblePlayerSessionIds.size === 0
    }

    /**
     * This function prepares the game for the next round. It should be called once the round ends, which is when the last player has played the last card of its hand.
     */
    private endRound() {

        this.players.forEach(player => {
            gameLogger.debug(`Player ${player.getSessionId()}: ${player.getWonTricks()} / ${player.getContract()}`)
            player.addToGameScore(this.score(this.roundIndex, player.getContract(), player.getWonTricks(), player.getBonusPoints()))
            gameLogger.debug(`Score : ${player.getGameScore()}`)
        })
        if (this.roundIndex === this.nbRounds) {
            this.isGameEnded = true
            this.endGame()
            return
        }
        this.roundIndex += 1
        this.trickIndex = 0
        gameLogger.debug(`---------- `)
        gameLogger.debug(`Start round ${this.roundIndex}`)
        this.roundFirstPlayerIndex = (this.roundFirstPlayerIndex + 1) % this.nbPlayers
        gameLogger.debug(`Round first player: ${this.players[this.roundFirstPlayerIndex].getSessionId()}`)
        this.trickFirstPlayerIndex = this.roundFirstPlayerIndex
        this.deck.shuffle()
        this.possibleActions.clear()
        this.possibleActions.add('setContract')
        this.clearPossiblePlayer()
        this.players.forEach(player => {
            player.resetRoundStats()
            this.addPossiblePlayer(player)
        })
        this.distributeCardsToPlayers()
    }

    private endGame(){
        this.clearTimer()
        gameLogger.debug('- GAME ENDED -')
    }

    private distributeCardsToPlayers() {
        const roundCards = this.deck.getCards(this.nbPlayers * this.roundIndex)
        for (let playerIndex = 0; playerIndex < this.nbPlayers; playerIndex++) {
            this.players[playerIndex].setCards(
                roundCards.slice(playerIndex * this.roundIndex, playerIndex * this.roundIndex + this.roundIndex)
            )
        }
    }

    /**
     * Return the cards that a player can play from his hand to the Pile (among all cards that he has in his hand). In Skull King, a player must play the color announced first if he has it in hand. The rules say that the player can avoid following this rule if the card that he wants to play is a "special card" (pirate or escape for example). 
     */
    private getPlayerPlayableCards(player: PlayerSK, trickColor?: SkColors) {
        const colorsInHand = player.getCards().map(card => card.color)
        if (colorsInHand.includes(trickColor) && trickColor !== undefined) {
            const playableCards: CardSK[] = []
            player.getCards().forEach(card => {
                if (card.color === trickColor || card.category === 'character' || card.category === 'escape') {
                    playableCards.push(card)
                }
            })
            return playableCards
        }
        return player.getCards()
    }

    public getRandomPossibleAction(): {playerId: string, action:Action} | undefined{
        const possiblePlayerSessionIds = [...this.possiblePlayerSessionIds.values()]
        const playerChoiceIndex = Math.floor(Math.random() * possiblePlayerSessionIds.length)
        const playerId = possiblePlayerSessionIds[playerChoiceIndex]
        if (this.possibleActions.has('setContract')){
            return {playerId: playerId, action: {type: 'setContract', contractValue: Math.floor(Math.random() * (this.roundIndex + 1))}}
        } else {
            const playerIndex = this.id2Index.get(playerId)
            if (playerIndex === undefined){
                gameLogger.error(`Error: id2Index return an undefined object for id '${playerId}'`)
                return
            }
            const player = this.players[playerIndex]
            const possibleCardsToPlay = this.getPlayerPlayableCards(player, this.pile.getTrickColor())
            const randomCardId = possibleCardsToPlay[Math.floor(Math.random() * possibleCardsToPlay.length)].getId()
            let scaryMaryChoice = undefined
            if (randomCardId === 'scaryMary'){
                const smChoice: ('escape' | 'pirate') [] = ['escape', 'pirate']
                scaryMaryChoice = smChoice[Math.floor(Math.random() * 2)]
            }
            return {playerId: playerId, action: {type: 'playCard', cardId: randomCardId, scaryMaryChoice: scaryMaryChoice}}
        }
    }

    private isPlayerAllowedToPlayCardInPile(cardId: string, player: PlayerSK, trickColor?: SkColors) {
        const playableCardIds: string[] = this.getPlayerPlayableCards(player, trickColor).map(card => card.id)
        return playableCardIds.includes(cardId)
    }

    private setTimer(timerDuration: number) {
        if (timerDuration >= this.minTimerDuration && timerDuration <= this.maxTimerduration) {
            this.timerDuration = Math.ceil(timerDuration)
            this.chronoValue = this.timerDuration
        }
        gameLogger.info(`Set Timer: ${this.timerDuration} sec per player`)
        this.timer = setInterval(() => {
            this.chronoValue = Math.max(0, this.chronoValue - 1)
            if (this.chronoValue === 0) {
                gameLogger.debug(`Time's up!`)
                if (this.possibleActions.has('setContract')) {
                    while (this.possibleActions.has('setContract')) {
                        this.updateStateRandomly()
                    }
                } else {
                    this.updateStateRandomly()
                }
                this.emitUpdateToPlayers()
            }
        }, 1000)
    }

    private refreshTimerForNextPlayer(){
        this.chronoValue = Math.ceil(this.timerDuration)
    }

    public clearTimer(){
        if (this.timer !== undefined){
            clearTimeout(this.timer)
        }
    }

    private updateStateRandomly() {
        const randomUpdate = this.getRandomPossibleAction()
        if (randomUpdate !== undefined) {
            this.updateState(randomUpdate.action, randomUpdate.playerId)
        } else {
            throw new Error('getRandomPossibleAction function returned an undefined object.')
        }
    }

    public emitGameStateUpdate(action: ActionSK, sessionId: string, socketId: string) {
        const isGlobalUpdate = this.isNextActionEmitsGlobalUpdate()
        if (this.updateState(action, sessionId)) {
            if (isGlobalUpdate) {
                this.emitUpdateToPlayers()
            } else {
                this.emitUpdateToPlayer(sessionId, socketId)
            }
        }
    }

    private emitUpdateToPlayer(sessionId: string, socketId: string) {
        const io = this.io
        if (io !== undefined) {
            io.to(socketId).emit('gameState', this.getPlayerState(sessionId))
        }
    }

    private emitUpdateToPlayers() {
        const io = this.io
        if (io !== undefined) {
            this.players.forEach(player => {
                const socketId = player.getSocketId()
                if (socketId !== undefined){
                    io.to(socketId).emit('gameState', this.getPlayerState(player.getSessionId()))}})
        }
    }


    public isNextActionEmitsGlobalUpdate() {
        return (
            !this.getPossibleActions().includes('setContract') ||
            (this.getPossibleActions().includes('setContract') && this.getPossiblePlayerSessionIds().length === 1)
        )
    }
}
