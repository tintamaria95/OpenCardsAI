import { randomInt } from 'crypto'
import { DeckSK } from './DeckSK'
import { PlayerSK } from './PlayerSK'
import { PileSK } from './PileSK'
import { gameLogger } from '../../logger'
import { AsyncGame } from '../commonClasses/AsyncGame'

export type ActionsSK = 'setContract' | 'playCard' | 'chooseScaryMaryType'

export type State = {
    nbPlayers: number,
    nbRounds: number,
    players: PlayerSK[],

    roundFirstPlayerIndex: number,
    trickFirstPlayerIndex: number,

    isGameEnded: boolean,
    pile: PileSK,
    roundIndex: number,
    trickIndex: number
}

type PlayerFrontState = {
    roundIndex: number,
    roundFirstPlayerIndex: number
    possibleActions: ActionsSK[],
    possiblePlayers: string[],
    pileCards: string[],
    contracts: number[],
    nbTricks: number[],
    scores: number[],
    // Private information
    playerHand: string[]
}


export class AsyncGameSK extends AsyncGame {
    private deck: DeckSK
    private id2Index: Map<string, number>
    private possibleActions: Set<ActionsSK>
    private possiblePlayerIds: Set<string>
    private state: State

    constructor(players: PlayerSK[], deck: DeckSK) {
        super()
        this.deck = deck
        this.deck.shuffle()


        this.id2Index =new Map<string, number>(),
        this.possibleActions = new Set<ActionsSK>(['setContract']),
        this.possiblePlayerIds = new Set(Array.from({ length: players.length }, (_, index) => players[index].getId()))

        this.state = {
            players: players,
            nbPlayers: players.length,
            isGameEnded: false,
            nbRounds: Math.min(
                10,
                Math.floor(deck.getDeckSize() / players.length)
            ),
            roundFirstPlayerIndex: 0,
            trickFirstPlayerIndex: 0,
            roundIndex: 1,
            trickIndex: 0,
            pile: new PileSK()
        }
        this.state.roundFirstPlayerIndex = randomInt(this.state.nbPlayers)
        this.state.trickFirstPlayerIndex = this.state.roundFirstPlayerIndex

        players.forEach((player, index) => {
            this.id2Index.set(player.getId(), index)
        })

        gameLogger.debug('- GAME STARTS -')
        gameLogger.debug(`Round first player: ${players[this.state.roundFirstPlayerIndex].getId()}`)
        this.distributeCardsToPlayers()
    }

    public getPlayerState(id: string): PlayerFrontState{
        return {
            // Public informations
            roundIndex: this.getRoundIndex(),
            roundFirstPlayerIndex: this.getRoundFirstPlayerIndex(),
            possibleActions: this.getPossibleActions(),
            possiblePlayers: this.getPossiblePlayers(),
            pileCards: this.getPileCards(),
            contracts: this.getContracts(),
            nbTricks: this.getNbTricks(),
            scores: this.getScores(),
            // Private information
            playerHand: this.getPlayerCards(id)

        }
    }

    public getPossibleActions(){
        return [...this.possibleActions.values()]
    }

    public getPossiblePlayers(){
        return [...this.possiblePlayerIds.values()]
    }

    public getRoundIndex() {
        return this.state.roundIndex
    }

    public getRoundFirstPlayerIndex(){
        return this.state.roundFirstPlayerIndex
    }

    getPileCards(){
        return this.state.pile.getCardsIds()
    }

    public getContracts(){
        const contracts: number[] = []
        this.state.players.forEach(player => contracts.push(player.getContract()))
        return contracts
    }

    public getNbTricks(){
        const tricks: number[] = []
        this.state.players.forEach(player => tricks.push(player.getWonTricks()))
        return tricks
    }

    public getScores(){
        const scores: number[] = []
        this.state.players.forEach(player => scores.push(player.getGameScore()))
        return scores
    }

    public getPlayerContract(id: string){
        const index = this.id2Index.get(id)
        if(index !== undefined){
            return this.state.players[index].getContract()
        }
    }

    public getPlayerNbTricks(id: string){
        const index = this.id2Index.get(id)
        if(index !== undefined){
            return this.state.players[index].getWonTricks()
        }
    }

    public getPlayerScore(id: string){
        const index = this.id2Index.get(id)
        if(index !== undefined){
            return this.state.players[index].getGameScore()
        }
    }

    public getPlayerCards(id: string){
        const index = this.id2Index.get(id)
        if(index !== undefined){
            return this.state.players[index].getHand()
        } else{
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
     * Security function which returns true if a player tries to play the wrong action or at the wrong moment.
     */
    public isActionAllowed(actionType: ActionsSK, playerId: string) {
        if (this.possibleActions.has(actionType) && this.possiblePlayerIds.has(playerId)) {
            return true
        }
        return false
    }

    /**
     * Method which can update the current state given a player id and action.
     * @param actionType Must be set to 'setContract' or 'playCard' (TODO add bloodyMary choice later)
     * @param action 
     * @param playerId 
     */
    public updateState(actionType: ActionsSK, action: number, playerId: string) {
        if (this.state.isGameEnded) {
            gameLogger.warn('Game ended - No action allowed anymore')
            return
        }
        if (!this.isActionAllowed(actionType, playerId)) {
            gameLogger.warn(`State update not allowed | actionType: ${actionType}, playerId: ${playerId}`)
            return
        }
        const playerIndex = this.id2Index.get(playerId)
        if (playerIndex === undefined) {
            gameLogger.error(`Logic error: playerId '${playerId}' undefined in map object 'id2Index'`)
            return
        }
        if (actionType === 'setContract') {
            if (this.actionSetContract(action, playerIndex)) {
                gameLogger.debug(`Player '${playerId}' sets contracts = ${action}`)
                if (this.isAllContractsSet()) {
                    this.possibleActions.delete('setContract')
                    this.possibleActions.add('playCard')
                    this.possiblePlayerIds.add(this.state.players[this.state.roundFirstPlayerIndex].getId())
                    gameLogger.debug('All players have set their contracts. Next phase: PlayCard')
                }
            }
        } else if (actionType === 'playCard') {
            if (this.actionPlayCard(action, playerIndex)) {
                if (this.isAllCardsPlayed()) {
                    gameLogger.debug(`Trick ${this.state.trickIndex + 1} ended`)
                    this.endTrick()
                } else {
                    this.waitForNextPlayer()
                }
            }
        
        } else if (actionType === 'chooseScaryMaryType') {
            // TODO
        } else {
            throw new Error(`Unknown action type: ${actionType}`)
        }
    }

    private actionSetContract(action: number, playerIndex: number) {
        if (action >= 0 && action <= this.state.roundIndex && Number.isInteger(action)) {
            this.state.players[playerIndex].setContract(action)
            this.possiblePlayerIds.delete(this.state.players[playerIndex].getId())
            return true
        } else {
            gameLogger.warn(`Cannot set a contract of value '${action}' at this.roundIndex ${this.state.roundIndex}`)
            return false
        }
    }

    private actionPlayCard(action: number, playerIndex: number) {
        const maxCardIndex = (this.state.roundIndex - this.state.trickIndex - 1)
        if (action >= 0 && action <= maxCardIndex && Number.isInteger(action)) {
            const chosenCard = this.state.players[playerIndex].playCard(action)
            gameLogger.debug(`'${this.state.players[playerIndex].getId()}' played ${chosenCard.id}`)
            this.state.pile.addCard(chosenCard)
            return true
        } else {
            gameLogger.warn(`'${this.state.players[playerIndex].getId()}'cannot play card of index '${action}'`)
            return false
        }
    }

    /**
     * This methods updates the class variables to allow the next player to do an action.
     */
    private waitForNextPlayer() {
        const currentPlayerId = this.possiblePlayerIds.values().next().value
        const currentPlayerIndex = this.id2Index.get(currentPlayerId)
        if (currentPlayerIndex === undefined) {
            gameLogger.error(`Unknown player Id '${currentPlayerId}'`)
            return
        }
        const nextPlayerIndex = (currentPlayerIndex + 1) % this.state.nbPlayers
        const nextPlayerId = this.state.players[nextPlayerIndex].getId()
        this.possiblePlayerIds.clear()
        this.possiblePlayerIds.add(nextPlayerId)
    }

    private endTrick() {
        // this.pile.show()
        gameLogger.debug('winning card: ' + this.state.pile.getWinningCardIndex().toString())
        this.state.trickFirstPlayerIndex = (this.state.trickFirstPlayerIndex + this.state.pile.getWinningCardIndex()) % this.state.nbPlayers
        gameLogger.debug('Trick winner: ' + this.state.players[this.state.trickFirstPlayerIndex].getId())
        this.state.players[this.state.trickFirstPlayerIndex].incrementWonTricks()
        this.state.players[this.state.trickFirstPlayerIndex].addToBonusPoints(this.state.pile.getBonusPoints())
        this.state.trickIndex += 1
        this.state.pile = new PileSK()
        this.possiblePlayerIds.clear()
        const trickFirstPlayerId = this.state.players[this.state.trickFirstPlayerIndex].getId()
        this.possiblePlayerIds.add(trickFirstPlayerId)
        if (this.state.trickIndex === this.state.roundIndex) {
            gameLogger.debug(`Round ${this.state.roundIndex} ended`)
            this.endRound()
        }

    }

    private isAllCardsPlayed() {
        return this.state.pile.getNbCards() === this.state.nbPlayers
    }

    private isAllContractsSet() {
        return this.possiblePlayerIds.size === 0
    }

    /**
     * This function prepares the game for the next round. It should be called once the round ends, which is when the last player has played the last card of its hand.
     */
    private endRound() {

        this.state.players.forEach(player => {
            gameLogger.debug(`Player ${player.getId()}: ${player.getWonTricks()} / ${player.getContract()}`)
            player.addToGameScore(this.score(this.state.roundIndex, player.getContract(), player.getWonTricks(), player.getBonusPoints()))
            gameLogger.debug(`Score : ${player.getGameScore()}`)
        })
        if (this.state.roundIndex === this.state.nbRounds) {
            this.state.isGameEnded = true
            gameLogger.debug('- GAME ENDED -')
            return
        }
        this.state.roundIndex += 1
        this.state.trickIndex = 0
        gameLogger.debug(`---------- `)
        gameLogger.debug(`Start round ${this.state.roundIndex}`)
        this.state.roundFirstPlayerIndex = (this.state.roundFirstPlayerIndex + 1) % this.state.nbPlayers
        gameLogger.debug(`Round first player: ${this.state.players[this.state.roundFirstPlayerIndex].getId()}`)
        this.state.trickFirstPlayerIndex = this.state.roundFirstPlayerIndex
        this.deck.shuffle()
        this.possibleActions.clear()
        this.possibleActions.add('setContract')
        this.possiblePlayerIds.clear()
        this.state.players.forEach(player => {
            this.possiblePlayerIds.add(player.getId())
            player.resetRoundStats()
        })
        this.distributeCardsToPlayers()
    }

    private distributeCardsToPlayers() {
        const round_cards = this.deck.getCards(this.state.nbPlayers * this.state.roundIndex)
        for (let p_i = 0; p_i < this.state.nbPlayers; p_i++) {
            this.state.players[p_i].set_cards(
                round_cards.slice(p_i * this.state.roundIndex, p_i * this.state.roundIndex + this.state.roundIndex)
            )
        }
    }
}
