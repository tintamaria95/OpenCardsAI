import { randomInt } from 'crypto'
import { Deck } from './Deck'
import { Player } from './Player'
import { Pile } from './Pile'
import { gameLogger } from '../../logger'

type Actions = 'setContract' | 'playCard'

export class AsyncGame {
    private deck: Deck
    private nbPlayers: number
    private nbRounds: number
    private players: Player[]
    private roundFirstPlayerIndex: number
    private foldFirstPlayerIndex: number

    // Async handlers
    private isGameEnded: boolean
    private id2Index: Map<string, number>
    private possibleActions: Set<Actions>
    private possiblePlayerIds: Set<string>
    private pile: Pile
    private roundIndex = 1
    private foldIndex = 0
    private cptCardsPlayed = 0

    constructor(players: Player[], deck: Deck) {
        gameLogger.debug('- GAME STARTS -')
        this.isGameEnded = false
        this.id2Index = new Map<string, number>()
        this.pile = new Pile()
        players.forEach((player, index) => {
            this.id2Index.set(player.getId(), index)
        })
        this.players = players
        this.nbPlayers = players.length
        this.deck = deck
        this.deck.shuffle()
        this.nbRounds = Math.min(
            10,
            Math.floor(deck.get_deck_size() / this.nbPlayers)
        )
        this.roundFirstPlayerIndex = randomInt(this.nbPlayers)
        gameLogger.debug(`Round first player: ${players[this.roundFirstPlayerIndex].getId()}`)
        
        this.foldFirstPlayerIndex = this.roundFirstPlayerIndex

        this.possibleActions = new Set<Actions>(['setContract'])
        this.possiblePlayerIds = new Set(Array.from({ length: players.length }, (_, index) => players[index].getId()))
        this.distributeCardsToPlayers()
    }

    getRoundIndex(){
        return this.roundIndex
    }

    /**
    * Returns the score for a given contract and the folds that a player won during this round. The bonus points are added to the score if the player completed its contract. 
    */
    public score(round: number, contract: number, wonFolds: number, bonusPoints: number) {
        if (contract === 0) {
            if (wonFolds === 0) {
                return round * 10
            } else {
                return round * (-10)
            }
        } else {
            if (contract === wonFolds) {
                return wonFolds * 20 + bonusPoints
            } else {
                return Math.abs(contract - wonFolds) * (-10)
            }
        }
    }

    /**
     * Security function which returns true if a player tries to play the wrong action or at the wrong moment.
     */
    isActionAllowed(actionType: 'setContract' | 'playCard', playerId: string) {
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
    updateState(actionType: Actions, action: number, playerId: string) {
        if (this.isGameEnded){
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
                    this.possiblePlayerIds.add(this.players[this.roundFirstPlayerIndex].getId())
                    gameLogger.debug('All players have set their contracts. Next phase: PlayCard')
                }
            }
        } else if (actionType === 'playCard') {
            if (this.actionPlayCard(action, playerIndex)) {
                if (this.isAllCardsPlayed()) {
                    gameLogger.debug(`Fold ${this.foldIndex + 1} ended`)
                    this.endFold()
                } else {
                    this.waitForNextPlayer()
                }
            }
        } else {
            throw new Error(`Unknown action type: ${actionType}`)
        }
    }

    actionSetContract(action: number, playerIndex: number) {
        if (action >= 0 && action <= this.roundIndex && Number.isInteger(action)) {
            this.players[playerIndex].setContract(action)
            this.possiblePlayerIds.delete(this.players[playerIndex].getId())
            return true
        } else {
            gameLogger.warn(`Cannot set a contract of value '${action}' at this.roundIndex ${this.roundIndex}`)
            return false
        }
    }

    actionPlayCard(action: number, playerIndex: number) {
        const maxCardIndex = (this.roundIndex - this.foldIndex - 1)
        if (action >= 0 && action <= maxCardIndex && Number.isInteger(action)) {
            const chosenCard = this.players[playerIndex].playCard(action)
            gameLogger.debug(`'${this.players[playerIndex].getId()}' played ${chosenCard.id}`)
            this.pile.addCard(chosenCard)
            this.cptCardsPlayed += 1
            return true
        } else {
            gameLogger.warn(`'${this.players[playerIndex].getId()}'cannot play card of index '${action}'`)
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
        const nextPlayerIndex = (currentPlayerIndex + 1) % this.nbPlayers
        const nextPlayerId = this.players[nextPlayerIndex].getId()
        this.possiblePlayerIds.clear()
        this.possiblePlayerIds.add(nextPlayerId)
    }

    private endFold() {
        // this.pile.show()
        gameLogger.debug('winning card: ' + this.pile.getWinningCardIndex().toString())
        this.foldFirstPlayerIndex = (this.foldFirstPlayerIndex + this.pile.getWinningCardIndex()) % this.nbPlayers
        gameLogger.debug('fold winner: ' + this.players[this.foldFirstPlayerIndex].getId())
        this.players[this.foldFirstPlayerIndex].incrementWonFolds()
        this.players[this.foldFirstPlayerIndex].addToBonusPoints(this.pile.getBonusPoints())
        this.foldIndex += 1
        this.pile = new Pile()
        this.cptCardsPlayed = 0
        this.possiblePlayerIds.clear()
        const foldFirstPlayerId = this.players[this.foldFirstPlayerIndex].getId()
        this.possiblePlayerIds.add(foldFirstPlayerId)
        if (this.foldIndex === this.roundIndex){
            gameLogger.debug(`Round ${this.roundIndex} ended`)
            this.endRound()
        }
        
    }

    private isAllCardsPlayed() {
        return this.cptCardsPlayed === this.nbPlayers
    }

    private isAllContractsSet() {
        return this.possiblePlayerIds.size === 0
    }

    /**
     * This function prepares the game for the next round. It should be called once the round ends, which is when the last player has played the last card of its hand.
     */
    endRound() {
        
        this.players.forEach(player => {
            gameLogger.debug(`Player ${player.getId()}: ${player.getWonFolds()} / ${player.getContract()}`)
            player.addToGameScore(this.score(this.roundIndex, player.getContract(), player.getWonFolds(), player.getBonusPoints()))
            gameLogger.debug(`Score : ${player.getGameScore()}`)
        })
        if(this.roundIndex === this.nbRounds){
            this.isGameEnded = true
            gameLogger.debug('- GAME ENDED -')
            return
        }
        this.roundIndex += 1
        this.foldIndex = 0
        gameLogger.debug(`---------- `)
        gameLogger.debug(`Start round ${this.roundIndex}`)
        this.roundFirstPlayerIndex = (this.roundFirstPlayerIndex + 1) % this.nbPlayers
        gameLogger.debug(`Round first player: ${this.players[this.roundFirstPlayerIndex].getId()}`)
        this.foldFirstPlayerIndex = this.roundFirstPlayerIndex
        this.deck.shuffle()
        this.possibleActions.clear()
        this.possibleActions.add('setContract')
        this.possiblePlayerIds.clear()
        this.players.forEach(player => {
            this.possiblePlayerIds.add(player.getId())
            player.resetRoundStats()})
        this.distributeCardsToPlayers()
    }

    distributeCardsToPlayers() {
        const round_cards = this.deck.get_cards(this.nbPlayers * this.roundIndex)
        for (let p_i = 0; p_i < this.nbPlayers; p_i++) {
            this.players[p_i].set_cards(
                round_cards.slice(p_i * this.roundIndex, p_i * this.roundIndex + this.roundIndex)
            )
        }
    }
}
