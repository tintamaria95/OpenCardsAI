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
    protected id2Index: Map<string, number>
    protected possibleActions: Set<Action['type']>
    protected possiblePlayerIds: Set<string>

    protected players: Player[]
    protected nbPlayers: number
    protected isGameEnded: boolean

    constructor(players: Player[], deck: Deck){
        this.deck = deck
        this.deck.shuffle()

        this.players =  players
        this.nbPlayers = players.length

        this.id2Index =new Map<string, number>()
        this.possibleActions = new Set<Action['type']>(['setContract'])
        this.possiblePlayerIds = new Set(Array.from({ length: players.length }, (_, index) => players[index].getId()))

        this.isGameEnded =  false
    }


    public setTimer(){
        const timer = setTimeout(() => {
            
        }, 30);
    }

    public isEnded(){
        return this.isGameEnded
    }

    /**
     * Security function which returns true if a player tries to play the wrong action or at the wrong moment.
     */
    public isActionAllowed(action: Action, playerId: string) {
        if (this.possibleActions.has(action['type']) && this.possiblePlayerIds.has(playerId)) {
            return true
        }
        return false
    }

    public getPossibleActions() {
        return [...this.possibleActions.values()]
    }

    public getPossiblePlayers() {
        return [...this.possiblePlayerIds.values()]
    }
}