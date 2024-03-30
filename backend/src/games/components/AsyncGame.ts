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
    private id2Index: Map<string, number>
    private index2Id: Map<number, string>
    private possibleActions: Set<Actions>
    private possiblePlayerIds: Set<string>
    private pile: Pile
    private roundIndex = 1
    private foldIndex = 0
    private cptCardsPlayed = 0

    constructor(players: Player[], deck: Deck) {
        this.id2Index = new Map<string, number>()
        this.index2Id = new Map<number, string>()
        this.pile = new Pile()
        players.forEach((player, index) => {
            this.id2Index.set(player.getId(), index)
            this.index2Id.set(index, player.getId())
        })
        this.players = players
        this.nbPlayers = players.length
        this.deck = deck
        this.deck.shuffle()
        this.nbRounds = Math.min(
            3,
            Math.floor(deck.get_deck_size() / this.nbPlayers)
        )
        this.roundFirstPlayerIndex = randomInt(this.nbPlayers)
        this.foldFirstPlayerIndex = this.roundFirstPlayerIndex

        this.possibleActions = new Set<Actions>(['setContract'])
        this.possiblePlayerIds = new Set(Array.from({ length: players.length }, (_, index) => players[index].getId()))
        this.distributeCardsToPlayers()
    }

    play() {
        for (let round = 1; round < 4; round++) {
            this.updateState("setContract", randomInt(round + 1), 'martin')
            this.updateState("setContract", randomInt(round + 1), 'charles')
            for (let i = 0; i < round; i++) {
                this.updateState("playCard", randomInt(round - i), 'martin')
                this.updateState("playCard", randomInt(round - i), 'charles')
                this.updateState("playCard", randomInt(round - i), 'martin')
            }
        }
    }

    getNumberRounds() {
        return this.nbRounds
    }

    /**
    * Returns the score for a given contract and the folds that a player won during this round. The bonus points are added to the score if the player completed its contract. 
    */
    score(contract: number, wonFolds: number, bonusPoints: number) {
        if (contract === 0) {
            if (wonFolds === 0) {
                return this.roundIndex * 10
            } else {
                return this.roundIndex * (-10)
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
    updateState(actionType: 'setContract' | 'playCard', action: number, playerId: string) {
        if (!this.isActionAllowed(actionType, playerId)) {
            gameLogger.warn(`State update not allowed | actionType: ${actionType}, playerId: ${playerId}`)
            return
        }
        const playerIndex = this.id2Index.get(playerId)
        if (playerIndex === undefined) {
            gameLogger.warn(`logic error: playerId '${playerId}' undefined in map object 'id2Index'`)
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
            this.actionPlayCard(action, playerIndex)
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
        if (action >= 0 && action <= (this.roundIndex - this.foldIndex) && Number.isInteger(action)) {
            console.log(`${this.index2Id.get(playerIndex)}'s hand before play: ${this.players[playerIndex].getHand()}`)
            console.log(action)
            const chosenCard = this.players[playerIndex].playCard(action)
            console.log(`${this.index2Id.get(playerIndex)}'s hand after play: ${this.players[playerIndex].getHand()}`)
            gameLogger.debug(`'${this.index2Id.get(playerIndex)}' played ${chosenCard.id}`)
            this.pile.addCard(chosenCard)
            this.cptCardsPlayed += 1
            if (this.isAllCardsPlayed()) {
                gameLogger.debug(`Fold ${this.foldIndex + 1} ended`)
                this.endFold()
             } else {
                this.waitForNextPlayer()
             }
            return true
        } else {
            gameLogger.warn(`Cannot play card of index '${action}'`)
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
        const nextPlayerId = this.index2Id.get(nextPlayerIndex)
        if (nextPlayerId === undefined) {
            gameLogger.error(`Unreachable player with index '${nextPlayerIndex}'`)
            return
        }
        this.possiblePlayerIds.clear()
        this.possiblePlayerIds.add(nextPlayerId)
    }

    private endFold() {
        // this.pile.show()
        gameLogger.debug('winning card: ' + this.pile.getWinningCardIndex().toString())
        this.foldFirstPlayerIndex = (this.foldFirstPlayerIndex + this.pile.getWinningCardIndex()) % this.nbPlayers
        gameLogger.debug('fold winner: ' + this.index2Id.get(this.foldFirstPlayerIndex))
        this.players[this.foldFirstPlayerIndex].incrementWonFolds()
        this.players[this.foldFirstPlayerIndex].addToBonusPoints(this.pile.getBonusPoints())
        this.foldIndex += 1
        this.pile = new Pile()
        this.cptCardsPlayed = 0
        this.possiblePlayerIds.clear()
        const foldFirstPlayerId = this.index2Id.get(this.foldFirstPlayerIndex)
        if (foldFirstPlayerId === undefined){
            gameLogger.error(`Unreachable player with index '${this.foldFirstPlayerIndex}'`)
            return
        }
        this.possiblePlayerIds.add(foldFirstPlayerId)
        if (this.foldIndex === this.roundIndex){
            gameLogger.debug(`Round ${this.roundIndex} ended`)
            this.endRoundUpdate()
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
    endRoundUpdate() {
        this.roundFirstPlayerIndex = (this.roundFirstPlayerIndex + 1) % this.nbPlayers
        this.foldFirstPlayerIndex = this.roundFirstPlayerIndex
        this.deck.shuffle()
        this.possibleActions.clear()
        this.possibleActions.add('setContract')
        this.possiblePlayerIds.clear()
        this.players.forEach(player => {this.possiblePlayerIds.add(player.getId())})
        this.roundIndex += 1
        this.foldIndex = 0
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

    play_round() {
        this.roundFirstPlayerIndex = (this.roundFirstPlayerIndex + 1) % this.nbPlayers
        this.foldFirstPlayerIndex = this.roundFirstPlayerIndex
        this.players.forEach(player => { player.resetRoundStats() })
        this.deck.shuffle()
        this.distributeCardsToPlayers()
        // Each player chooses a contract // Must change to simultaneous later
        for (let p_i = 0; p_i < this.nbPlayers; p_i++) {
            const randContract = randomInt(this.roundIndex)
            this.players[p_i].setContract(randContract)
        }
        // Each player add a card to the Pile
        for (let card_i = 0; card_i < this.roundIndex; card_i++) {
            gameLogger.debug('first player: ' + this.foldFirstPlayerIndex)
            const pile = new Pile()
            for (let p_i = 0; p_i < this.nbPlayers; p_i++) {
                const playerIndex = (p_i + this.foldFirstPlayerIndex) % this.nbPlayers
                const chosenCard = this.players[playerIndex].playCard(randomInt(this.roundIndex - card_i))
                pile.addCard(chosenCard)
            }
            pile.show()
            gameLogger.debug('winning card: ' + pile.getWinningCardIndex().toString())
            this.foldFirstPlayerIndex = (this.foldFirstPlayerIndex + pile.getWinningCardIndex()) % this.nbPlayers
            gameLogger.debug('fold winner: ' + (this.foldFirstPlayerIndex.toString()))
            this.players[this.foldFirstPlayerIndex].incrementWonFolds()
            this.players[this.foldFirstPlayerIndex].addToBonusPoints(pile.getBonusPoints())
        }
        gameLogger.debug('player folds:')
        this.players.forEach(player => {
            gameLogger.debug(`Player ${player.getId()}: ${player.getWonFolds()} / ${player.getContract()}`)
            player.addToGameScore(this.score(player.getContract(), player.getWonFolds(), player.getBonusPoints()))
            gameLogger.debug(`Score : ${player.getGameScore()}`)
        })
        gameLogger.debug(`end this.roundIndex ${this.roundIndex}`)
    }
}
