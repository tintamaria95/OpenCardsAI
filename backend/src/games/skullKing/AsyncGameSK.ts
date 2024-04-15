import { randomInt } from 'crypto'
import { DeckSK } from './DeckSK'
import { PlayerSK } from './PlayerSK'
import { PileSK } from './PileSK'
import { gameLogger } from '../../logger'
import { AsyncGame, AsyncGameInterface } from '../commonClasses/AsyncGame'
import { CardSK, SkColors } from './CardSK'
import { ActionSetContract, ActionPlayCard } from './ActionSK'
import { Action } from '../commonClasses/Action'


type PlayerFrontState = {
    roundIndex: number
    roundFirstPlayerIndex: number
    possibleActions: Action['type'][]
    possiblePlayers: string[]
    pileCards: string[]
    contracts: number[]
    nbTricks: number[]
    scores: number[]
    // Private information
    playerHand: string[]
}


export class AsyncGameSK extends AsyncGame implements AsyncGameInterface{

    protected players: PlayerSK[]

    private nbRounds: number
    private roundFirstPlayerIndex: number
    private trickFirstPlayerIndex: number
    private roundIndex: number
    private trickIndex: number
    private pile: PileSK

    constructor(players: PlayerSK[], deck: DeckSK) {
        super(players, deck)
        this.players = players
        
        this.nbRounds = Math.min(
            10,
            Math.floor(deck.getDeckSize() / players.length)
        )
        this.roundFirstPlayerIndex = randomInt(this.nbPlayers)
        this.trickFirstPlayerIndex = this.roundFirstPlayerIndex
        this.roundIndex = 1
        this.trickIndex = 0
        this.pile = new PileSK()

        players.forEach((player, index) => {
            this.id2Index.set(player.getId(), index)
        })

        gameLogger.debug('- GAME STARTS -')
        gameLogger.debug(`Round first player: ${players[this.roundFirstPlayerIndex].getId()}`)
        this.distributeCardsToPlayers()
    }

    public getPlayerState(playerId: string): PlayerFrontState {
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
            playerHand: this.getPlayerCardIds(playerId)

        }
    }

    public getRoundIndex() {
        return this.roundIndex
    }

    public getRoundFirstPlayerIndex() {
        return this.roundFirstPlayerIndex
    }

    getPileCards() {
        return this.pile.getCardsIds()
    }

    public getContracts() {
        const contracts: number[] = []
        this.players.forEach(player => contracts.push(player.getContract()))
        return contracts
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
     * Method which can update the current state given a player id and action.
     * @param actionType Must be set to 'setContract' or 'playCard' (TODO add bloodyMary choice later)
     * @param action 
     * @param playerId 
     */
    public updateState(action: Action, playerId: string) {
        if (this.isGameEnded) {
            gameLogger.warn('Game ended - No action allowed anymore')
            return
        }
        if (!this.isActionAllowed(action, playerId)) {
            gameLogger.warn(`State update not allowed | actionType: ${action['type']}, playerId: ${playerId}`)
            return
        }
        const playerIndex = this.id2Index.get(playerId)
        if (playerIndex === undefined) {
            gameLogger.error(`Logic error: playerId '${playerId}' undefined in map object 'id2Index'`)
            return
        }
        const player = this.players[playerIndex]
        if (action['type'] === 'setContract') {
            if (this.actionSetContract(action, player)) {
                gameLogger.debug(`Player '${playerId}' sets contracts = ${action['contractValue']}`)
                if (this.isAllContractsSet()) {
                    this.possibleActions.clear()
                    this.possibleActions.add('playCard')
                    this.possiblePlayerIds.add(this.players[this.roundFirstPlayerIndex].getId())
                    gameLogger.debug('All players have set their contracts. Next phase: PlayCard')
                }
            }
        } else if (action['type'] === 'playCard') {
            if (this.actionPlayCard(action, player)) {
                if (this.isAllCardsPlayed()) {
                    gameLogger.debug(`Trick ${this.trickIndex + 1} ended`)
                    this.endTrick()
                } else {
                    this.setForNextPlayer()
                }
            }
        } 
    }

    private actionSetContract(action: ActionSetContract, player: PlayerSK) {
        if (action['contractValue'] >= 0 && action['contractValue'] <= this.roundIndex && Number.isInteger(action['contractValue'])) {
            player.setContract(action['contractValue'])
            this.possiblePlayerIds.delete(player.getId())
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
                gameLogger.debug(`'${player.getId()}' played ${chosenCard.id}`)
                this.pile.addCard(chosenCard)
                return true
            }
        } else {
            gameLogger.warn(`'${player.getId()}'cannot play card of id '${action['cardId']}'`)
        }
        return false
    }

    /**
     * This methods updates the class variables to allow the next player to do an action.
     */
    private setForNextPlayer() {
        const currentPlayerId = [...this.possiblePlayerIds][0]
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

    private endTrick() {
        // this.pile.show()
        gameLogger.debug('winning card: ' + this.pile.getCurrentWinningCardIndex().toString())
        this.trickFirstPlayerIndex = (this.trickFirstPlayerIndex + this.pile.getCurrentWinningCardIndex()) % this.nbPlayers
        gameLogger.debug('Trick winner: ' + this.players[this.trickFirstPlayerIndex].getId())
        this.players[this.trickFirstPlayerIndex].incrementWonTricks()
        this.players[this.trickFirstPlayerIndex].addToBonusPoints(this.pile.getBonusPoints())
        this.trickIndex += 1
        this.pile = new PileSK()
        this.possiblePlayerIds.clear()
        const trickFirstPlayerId = this.players[this.trickFirstPlayerIndex].getId()
        this.possiblePlayerIds.add(trickFirstPlayerId)
        if (this.trickIndex === this.roundIndex) {
            gameLogger.debug(`Round ${this.roundIndex} ended`)
            this.endRound()
        }

    }

    private isAllCardsPlayed() {
        return this.pile.getNbCards() === this.nbPlayers
    }

    private isAllContractsSet() {
        return this.possiblePlayerIds.size === 0
    }

    /**
     * This function prepares the game for the next round. It should be called once the round ends, which is when the last player has played the last card of its hand.
     */
    private endRound() {

        this.players.forEach(player => {
            gameLogger.debug(`Player ${player.getId()}: ${player.getWonTricks()} / ${player.getContract()}`)
            player.addToGameScore(this.score(this.roundIndex, player.getContract(), player.getWonTricks(), player.getBonusPoints()))
            gameLogger.debug(`Score : ${player.getGameScore()}`)
        })
        if (this.roundIndex === this.nbRounds) {
            this.isGameEnded = true
            gameLogger.debug('- GAME ENDED -')
            return
        }
        this.roundIndex += 1
        this.trickIndex = 0
        gameLogger.debug(`---------- `)
        gameLogger.debug(`Start round ${this.roundIndex}`)
        this.roundFirstPlayerIndex = (this.roundFirstPlayerIndex + 1) % this.nbPlayers
        gameLogger.debug(`Round first player: ${this.players[this.roundFirstPlayerIndex].getId()}`)
        this.trickFirstPlayerIndex = this.roundFirstPlayerIndex
        this.deck.shuffle()
        this.possibleActions.clear()
        this.possibleActions.add('setContract')
        this.possiblePlayerIds.clear()
        this.players.forEach(player => {
            this.possiblePlayerIds.add(player.getId())
            player.resetRoundStats()
        })
        this.distributeCardsToPlayers()
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
        const possiblePlayerIds = [...this.possiblePlayerIds.values()]
        const playerChoiceIndex = Math.floor(Math.random() * possiblePlayerIds.length)
        const playerId = possiblePlayerIds[playerChoiceIndex]
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
}
