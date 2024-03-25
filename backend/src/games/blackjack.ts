type State = {
    nextPhase: string,
    possibleActions: string[],
    dealer_score: number,
    dealer_cards: Card[],
    player_score: number,
    player_cards : Card[]
}

class Card{
    declare color: string
    declare value: number | string
    constructor(name: string, value: number | string){
        this.color = name
        this.value = value
    }

    get_long_name(){
        let long_color = ''
        if (this.color === 'S'){
            long_color = 'spades'
        } else if (this.color === 'H'){
            long_color = 'hearts'
        } else if (this.color === 'D'){
            long_color = 'diamonds'
        } else if (this.color === 'C'){
            long_color = 'clubs'
        } else {
            throw new Error('Unknown color letter')
        }

        let long_value = ''
        if (this.value === 'A'){
            long_value = 'Ace'
        } else if (this.value === 'K'){
            long_value = 'King'
        } else if (this.value === 'Q'){
            long_value = 'Queen'
        } else if (this.value === 'J'){
            long_value = 'Jack'
        } else {
            long_value = this.value.toString()
        }
        return long_value + ' of ' + long_color
    }
}


class BlackJack {
    /***
     *  The goal of this class is to present an architecture suitable for multiplayer calls: playable actions and update game state. 
     * 
     */

    declare cards: Card[]
    declare state : State
    declare draw_index: number

    constructor(cards: Card[]) {
        this.cards = cards
        this.state = {
            nextPhase: 'deal',
            possibleActions: [],
            dealer_score: 0,
            dealer_cards: [],
            player_score: 0,
            player_cards: []
        }
        this.draw_index = 0
    }

    private get_player_hand(){
        return this.state.player_cards
    }

    private get_dealer_hand(isRevealed: boolean){
        if(isRevealed){
            return this.state.dealer_cards
        } else{
            return this.state.dealer_cards[0]
        }
    }

    private get_score(cards: Card[], isMin: boolean) {
        /**
         * Returns the score of the hand. If the hand contains an ace, it's worths 1.
         */
        let score = 0
        cards.forEach(card => {
            if (card.value === 'A') {
                if (isMin) { 
                    score += 1 }
                else {
                    score += 11
                }
            }  else if (card.value === 'J' || card.value === 'Q' || card.value === 'K'){
                score += 10
            } else if (typeof card.value == 'number') {
                score += card.value
            } else {
                throw new Error('Unknown card.value: ' + card.value.toString())
            }
        })
        return score
    }

    private get_player_min_score(){
     return this.get_score(this.state.player_cards, true)   
    }

    private get_player_max_score(){
        return this.get_score(this.state.player_cards, false)   
       }

    private get_dealer_min_score(){
        return this.get_score(this.state.dealer_cards, true)
    }

    private get_dealer_max_score(){
        return this.get_score(this.state.dealer_cards, false)
    }

    private isBlackJackHand(card1: Card, card2: Card){
        if (card1.value === 'A' || card2.value === 'A'){
            if (card1.value === 10 || card2.value === 10){
                return true
            }
        }
        return false
    }

    private player_draws_card(){
        console.log('Player draws card')
        this.state.player_cards.push(this.cards[this.draw_index])
        this.draw_index += 1
    }

    private dealer_draws_card(){
        console.log('Dealer draws card')
        this.state.dealer_cards.push(this.cards[this.draw_index])
        this.draw_index += 1
    }

    private isPlayerBusts(){
        if (this.get_player_min_score() > 21){
            return true
        }
        else false
    }

    private isDealerBusts(){
        if(this.get_dealer_min_score() > 21){
            return true
        }
        return false
    }

    private dealPhase() {
        this.state.dealer_cards.push(this.cards[0], this.cards[1])
        this.state.player_cards.push(this.cards[2], this.cards[3])
        this.draw_index = 4
        console.log('Player hand:')
        console.log(this.get_player_hand())
        console.log('Dealer visible card:')
        console.log(this.get_dealer_hand(false))
        if (this.isBlackJackHand(this.state.player_cards[0], this.state.player_cards[1])) {
            if (this.isBlackJackHand(this.state.dealer_cards[0], this.state.dealer_cards[1])) {
                console.log('Blackjack - Push - Player and Dealer have Blackjack')
            } else {
                console.log('Blackjack - Player victory')
            }
            this.state.nextPhase = 'ended'
        } else {
            this.state.possibleActions = ['hit', 'stand']
            this.state.nextPhase = 'playerTurn'
        }
    }

    private playerTurnPhase(action?: string){
        if(action !== undefined){
            if (action === 'hit'){
                this.player_draws_card()
                if (this.isPlayerBusts()){
                    console.log('Player busted | Player score : ' + this.get_player_min_score().toString())
                    console.log(this.get_player_hand())
                    this.state.nextPhase = 'ended'
                } else {
                    console.log('Player hand: ')
                    console.log(this.get_player_hand())
                }
            } else if (action === 'stand') {
                this.dealerTurnPhase()
            } else {
                throw new Error('Unknown action: ' + action)
            }
        } else {
            throw new Error('Undefined action type')
        }
    }

    dealerTurnPhase(){
        console.log('- Dealer Turn Phase - ')
        console.log(this.get_dealer_hand(true))
        while(this.get_dealer_max_score() < 17 || (this.get_dealer_min_score() < 17 && this.get_dealer_max_score() > 21)){
            this.dealer_draws_card()
            console.log('Dealer hand')
            console.log(this.get_dealer_hand(true))
        }
        if(this.isDealerBusts()){
            console.log('Dealer busts -> Player wins')
            this.state.nextPhase = 'ended'
        } else {
            let player_score = 0
            let dealer_score = 0
            if (this.get_player_max_score() <= 21) {
                player_score = this.get_player_max_score()
            } else {
                player_score = this.get_player_min_score()
            }
            if (this.get_dealer_max_score() <= 21){
                dealer_score = this.get_dealer_max_score()
            } else {
                dealer_score = this.get_dealer_min_score()
            }
            console.log('Player score: ' + player_score.toString())
            console.log('Dealer score: ' + dealer_score.toString())
            if (player_score > dealer_score){
                console.log('Player wins !')
            } else if (player_score < dealer_score){
                console.log('Dealer wins !')
            } else {
                console.log('Tie, it is a push !')
            }

        }
    }

    updateState(action?: string){
        if (this.state.nextPhase === 'deal'){
            this.dealPhase()
            return
        }
        if (this.state.nextPhase === 'playerTurn'){
            this.playerTurnPhase(action)
            return
        }
    }

    play_action(playerId: number, action: string, value: number) {

    }

    shuffle_cards(){
        const shuffled_cards = [...this.cards]
        this.cards =  shuffled_cards.sort(() => Math.random() - 0.5)
    }
}

const v_cards = Array.from({length: 9}, (_, index) => index + 2)
const colors = ['S', 'C', 'H', 'D']
const h_cards = ['J', 'Q', 'K', 'A']
const cards = Array.from({length: 4}, (_, index) => [...v_cards, ...h_cards]).flat()
const colored_cards = Array.from({length: 52}, (_, index) => {
    if (index < 13){
        return new Card('S', cards[index])
    } else if (index < 26){
        return new Card('C', cards[index])
    } else if (index < 39){
        return new Card('H', cards[index])
    } else {
        return new Card('D', cards[index])
    }
})

const bj = new BlackJack(colored_cards)
bj.shuffle_cards()
bj.updateState()
bj.updateState('hit')
bj.updateState('stand')