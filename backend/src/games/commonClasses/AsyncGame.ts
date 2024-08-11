import { Action } from "./Action";
import { Player } from "./Player";
import { Deck } from "./Deck";


export interface AsyncGameInterface {
    updateState(action: Action, playerId: string): void;
}

/**
 * This class must handle the game logic: Refs to players, their cards, scores etc. 
 */
export class AsyncGame {

    protected deck: Deck

    protected players: Player[]
    protected nbPlayers: number

    protected id2Index: Map<string, number>
    protected possibleActions: Set<Action['type']>
    protected possiblePlayerSessionIds: Set<string>

    protected isGameEnded: boolean

    // STATIC
    protected static minPlayers = 2
    protected static maxPlayers = 8

    // FRONT ONLY
    protected possiblePlayerUserIds: Set<string>


    constructor(players: Player[], deck: Deck){
        this.deck = deck
        this.deck.shuffle()

        this.players =  players
        this.players.map((player, index) => player.setSeat(index))
        this.nbPlayers = players.length

        this.id2Index =new Map<string, number>()
        this.possibleActions = new Set<Action['type']>(['setContract'])
        this.possiblePlayerSessionIds = new Set(Array.from({ length: players.length }, (_, index) => players[index].getSessionId()))

        this.isGameEnded =  false

        this.possiblePlayerUserIds = new Set(Array.from({ length: players.length }, (_, index) => players[index].getSessionId()))
    }

    public getIsGameEnded(){
        return this.isGameEnded
    }


    /**
     * Security function which returns true if a player tries to play the wrong action or at the wrong moment.
     */
    public isActionAllowed(action: Action, playerId: string) {
        if (this.possibleActions.has(action['type']) && this.possiblePlayerSessionIds.has(playerId)) {
            return true
        }
        return false
    }

    public getNbPlayers(){
        return this.nbPlayers
    }

    public getPossibleActions() {
        return [...this.possibleActions.values()]
    }

    public getPossiblePlayerSessionIds() {
        return [...this.possiblePlayerSessionIds.values()]
    }

    public getPossiblePlayerUserIds(){
        return [...this.possiblePlayerUserIds.values()]
    }

    protected addPossiblePlayer(player: Player){
        this.possiblePlayerSessionIds.add(player.getSessionId())
        this.possiblePlayerUserIds.add(player.getUserId())
    }

    protected clearPossiblePlayer(){
        this.possiblePlayerSessionIds.clear()
        this.possiblePlayerUserIds.clear()
    }
}